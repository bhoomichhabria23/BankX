// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BankXAMM is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_FEE_BPS = 30;
    uint256 public feeBps = MAX_FEE_BPS;
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant PROTOCOL_BANK_SEED = 10_000 ether;
    uint256 private constant USDC_PRICE_SCALE = 1e30;

    IERC20 public immutable bankToken;
    IERC20 public immutable usdcToken;
    address public immutable setupAuthority;
    address public governance;
    uint256 public reserveBank;
    uint256 public reserveUsdc;

    error InvalidTokenConfiguration();
    error DeadlineExpired();
    error PoolNotInitialized();
    error PoolAlreadyInitialized();
    error InitialPriceBelowMinimum(uint256 price, uint256 minimumPrice);
    error InsufficientOutput(uint256 output, uint256 minimumOutput);
    error InsufficientLiquidity();
    error LastLiquidityProviderCannotExit();
    error Unauthorized();
    error InvalidFee();

    event PoolInitialized(address indexed provider, uint256 bankAmount, uint256 usdcAmount, uint256 initialPrice);
    event LiquidityAdded(address indexed provider, uint256 bankAmount, uint256 usdcAmount, uint256 lpTokens);
    event LiquidityRemoved(address indexed provider, uint256 bankAmount, uint256 usdcAmount, uint256 lpTokens);
    event Swap(address indexed trader, address indexed tokenIn, uint256 amountIn, uint256 amountOut);
    event GovernanceConfigured(address indexed governance);
    event FeeUpdated(uint256 feeBps);

    constructor(IERC20 bankToken_, IERC20 usdcToken_)
        ERC20("BankX Liquidity Share", "bxLP")
    {
        if (
            address(bankToken_) == address(0)
                || address(usdcToken_) == address(0)
                || address(bankToken_) == address(usdcToken_)
                || IERC20Metadata(address(bankToken_)).decimals() != 18
                || IERC20Metadata(address(usdcToken_)).decimals() != 6
        ) revert InvalidTokenConfiguration();

        bankToken = bankToken_;
        usdcToken = usdcToken_;
        setupAuthority = msg.sender;
    }

    function configureGovernance(address governance_) external {
        if (msg.sender != setupAuthority || governance != address(0) || governance_ == address(0)) {
            revert Unauthorized();
        }
        governance = governance_;
        emit GovernanceConfigured(governance_);
    }

    function setFeeBps(uint256 nextFeeBps) external {
        if (msg.sender != governance || governance == address(0)) revert Unauthorized();
        if (nextFeeBps > MAX_FEE_BPS) revert InvalidFee();
        feeBps = nextFeeBps;
        emit FeeUpdated(nextFeeBps);
    }

    function initializePool(
        uint256 usdcAmount,
        uint256 minimumUsdcPerBank,
        uint256 minimumLpTokens,
        uint256 deadline
    ) external nonReentrant {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (totalSupply() != 0 || reserveBank != 0 || reserveUsdc != 0) {
            revert PoolAlreadyInitialized();
        }

        uint256 bankAmount = bankToken.balanceOf(address(this));
        if (bankAmount < PROTOCOL_BANK_SEED || usdcAmount == 0) {
            revert InsufficientLiquidity();
        }

        uint256 initialPrice = Math.mulDiv(usdcAmount, USDC_PRICE_SCALE, bankAmount);
        if (initialPrice < minimumUsdcPerBank) {
            revert InitialPriceBelowMinimum(initialPrice, minimumUsdcPerBank);
        }

        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);
        uint256 liquidity = Math.sqrt(bankAmount * usdcAmount);
        if (liquidity < minimumLpTokens || liquidity == 0) {
            revert InsufficientOutput(liquidity, minimumLpTokens);
        }

        reserveBank = bankAmount;
        reserveUsdc = usdcAmount;
        _mint(msg.sender, liquidity);

        emit PoolInitialized(msg.sender, bankAmount, usdcAmount, initialPrice);
    }

    function addLiquidity(
        uint256 bankAmountDesired,
        uint256 usdcAmountDesired,
        uint256 minimumLpTokens,
        uint256 deadline
    ) external nonReentrant returns (uint256 bankAmount, uint256 usdcAmount, uint256 liquidity) {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (reserveBank == 0 || reserveUsdc == 0 || totalSupply() == 0) {
            revert PoolNotInitialized();
        }

        uint256 matchedUsdc = Math.mulDiv(bankAmountDesired, reserveUsdc, reserveBank);
        if (matchedUsdc <= usdcAmountDesired) {
            bankAmount = bankAmountDesired;
            usdcAmount = matchedUsdc;
        } else {
            bankAmount = Math.mulDiv(usdcAmountDesired, reserveBank, reserveUsdc);
            usdcAmount = usdcAmountDesired;
        }
        if (bankAmount == 0 || usdcAmount == 0) revert InsufficientLiquidity();

        liquidity = Math.min(
            Math.mulDiv(bankAmount, totalSupply(), reserveBank),
            Math.mulDiv(usdcAmount, totalSupply(), reserveUsdc)
        );
        if (liquidity < minimumLpTokens || liquidity == 0) {
            revert InsufficientOutput(liquidity, minimumLpTokens);
        }

        IERC20(address(bankToken)).safeTransferFrom(msg.sender, address(this), bankAmount);
        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);
        _mint(msg.sender, liquidity);
        _syncReserves();

        emit LiquidityAdded(msg.sender, bankAmount, usdcAmount, liquidity);
    }

    function removeLiquidity(
        uint256 lpTokens,
        uint256 minimumBank,
        uint256 minimumUsdc,
        uint256 deadline
    ) external nonReentrant returns (uint256 bankAmount, uint256 usdcAmount) {
        if (block.timestamp > deadline) revert DeadlineExpired();
        uint256 supply = totalSupply();
        if (lpTokens == 0 || lpTokens > balanceOf(msg.sender)) revert InsufficientLiquidity();
        if (supply <= lpTokens) revert LastLiquidityProviderCannotExit();

        bankAmount = Math.mulDiv(lpTokens, reserveBank, supply);
        usdcAmount = Math.mulDiv(lpTokens, reserveUsdc, supply);
        if (bankAmount < minimumBank) revert InsufficientOutput(bankAmount, minimumBank);
        if (usdcAmount < minimumUsdc) revert InsufficientOutput(usdcAmount, minimumUsdc);

        _burn(msg.sender, lpTokens);
        IERC20(address(bankToken)).safeTransfer(msg.sender, bankAmount);
        usdcToken.safeTransfer(msg.sender, usdcAmount);
        _syncReserves();

        emit LiquidityRemoved(msg.sender, bankAmount, usdcAmount, lpTokens);
    }

    function swapBankForUsdc(
        uint256 amountIn,
        uint256 minimumAmountOut,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (reserveBank == 0 || reserveUsdc == 0) revert PoolNotInitialized();
        IERC20(address(bankToken)).safeTransferFrom(msg.sender, address(this), amountIn);
        amountOut = _amountOut(amountIn, reserveBank, reserveUsdc);
        if (amountOut < minimumAmountOut) revert InsufficientOutput(amountOut, minimumAmountOut);

        usdcToken.safeTransfer(msg.sender, amountOut);
        _syncReserves();
        emit Swap(msg.sender, address(bankToken), amountIn, amountOut);
    }

    function swapUsdcForBank(
        uint256 amountIn,
        uint256 minimumAmountOut,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (reserveBank == 0 || reserveUsdc == 0) revert PoolNotInitialized();
        usdcToken.safeTransferFrom(msg.sender, address(this), amountIn);
        amountOut = _amountOut(amountIn, reserveUsdc, reserveBank);
        if (amountOut < minimumAmountOut) revert InsufficientOutput(amountOut, minimumAmountOut);

        IERC20(address(bankToken)).safeTransfer(msg.sender, amountOut);
        _syncReserves();
        emit Swap(msg.sender, address(usdcToken), amountIn, amountOut);
    }

    function quoteBankForUsdc(uint256 amountIn) external view returns (uint256) {
        return _amountOut(amountIn, reserveBank, reserveUsdc);
    }

    function quoteUsdcForBank(uint256 amountIn) external view returns (uint256) {
        return _amountOut(amountIn, reserveUsdc, reserveBank);
    }

    function _amountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        private
        view
        returns (uint256)
    {
        if (reserveIn == 0 || reserveOut == 0 || amountIn == 0) return 0;
        uint256 amountInAfterFee = amountIn * (BPS_DENOMINATOR - feeBps);
        return Math.mulDiv(
            amountInAfterFee,
            reserveOut,
            reserveIn * BPS_DENOMINATOR + amountInAfterFee
        );
    }

    function _syncReserves() private {
        reserveBank = bankToken.balanceOf(address(this));
        reserveUsdc = usdcToken.balanceOf(address(this));
    }
}