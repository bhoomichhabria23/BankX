// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BankXStaking is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant REWARD_BUDGET_CAP = 90_000 ether;
    uint256 public constant INITIAL_REWARD_PER_DAY = 1_000 ether;
    uint256 public constant INITIAL_REWARD_DURATION = 90 days;
    uint256 private constant REWARD_PRECISION = 1e18;

    IERC20 public immutable bankToken;
    address public immutable treasury;
    address public governance;
    address public immutable setupAuthority;

    uint256 public totalStaked;
    uint256 public totalFunded;
    uint256 public rewardReserve;
    uint256 public totalRewardsPaid;
    uint256 public rewardRatePerSecond;
    uint256 public periodFinish;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address account => uint256) public stakedBalance;
    mapping(address account => uint256) public rewards;
    mapping(address account => uint256) private _userRewardPerTokenPaid;

    error Unauthorized();
    error InvalidConfiguration();
    error RewardBudgetExceeded();
    error RewardsNotFunded();
    error InvalidAmount();
    error InsufficientStake();

    event RewardFundingReceived(uint256 amount, uint256 totalFunded);
    event GovernanceConfigured(address indexed governance);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardScheduleChanged(uint256 ratePerSecond, uint256 periodFinish);

    constructor(IERC20 bankToken_, address treasury_) {
        if (address(bankToken_) == address(0) || treasury_ == address(0)) {
            revert InvalidConfiguration();
        }

        bankToken = bankToken_;
        treasury = treasury_;
        setupAuthority = msg.sender;
        rewardRatePerSecond = INITIAL_REWARD_PER_DAY / 1 days;
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + INITIAL_REWARD_DURATION;
    }

    modifier onlyGovernance() {
        if (msg.sender != governance || governance == address(0)) revert Unauthorized();
        _;
    }

    function configureGovernance(address governance_) external {
        if (msg.sender != setupAuthority || governance != address(0) || governance_ == address(0)) {
            revert Unauthorized();
        }
        governance = governance_;
        emit GovernanceConfigured(governance_);
    }

    function fundRewards(uint256 amount) external nonReentrant {
        if (msg.sender != treasury && !(msg.sender == setupAuthority && totalFunded == 0)) {
            revert Unauthorized();
        }
        if (amount == 0) revert InvalidAmount();
        if (totalFunded + amount > REWARD_BUDGET_CAP) revert RewardBudgetExceeded();

        bankToken.safeTransferFrom(msg.sender, address(this), amount);
        totalFunded += amount;
        rewardReserve += amount;
        emit RewardFundingReceived(amount, totalFunded);
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        if (amount == 0) revert InvalidAmount();
        if (totalFunded != REWARD_BUDGET_CAP) revert RewardsNotFunded();

        totalStaked += amount;
        stakedBalance[msg.sender] += amount;
        bankToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        if (amount == 0 || amount > stakedBalance[msg.sender]) revert InsufficientStake();

        totalStaked -= amount;
        stakedBalance[msg.sender] -= amount;
        bankToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant updateReward(msg.sender) returns (uint256 amount) {
        amount = rewards[msg.sender];
        if (amount == 0) revert InvalidAmount();
        if (amount > rewardReserve) amount = rewardReserve;

        rewards[msg.sender] -= amount;
        rewardReserve -= amount;
        totalRewardsPaid += amount;
        bankToken.safeTransfer(msg.sender, amount);
        emit RewardsClaimed(msg.sender, amount);
    }

    function earned(address account) external view returns (uint256) {
        return Math.mulDiv(
            stakedBalance[account],
            rewardPerToken() - _userRewardPerTokenPaid[account],
            REWARD_PRECISION
        ) + rewards[account];
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;
        uint256 applicableTime = _lastTimeRewardApplicable();
        uint256 elapsed = applicableTime - lastUpdateTime;
        return rewardPerTokenStored
            + Math.mulDiv(elapsed * rewardRatePerSecond, REWARD_PRECISION, totalStaked);
    }

    function rescheduleRemainingRewards(uint256 duration) external onlyGovernance updateReward(address(0)) {
        if (duration == 0 || duration > INITIAL_REWARD_DURATION) revert InvalidConfiguration();
        if (block.timestamp >= periodFinish) revert InvalidConfiguration();

        uint256 remaining = (periodFinish - block.timestamp) * rewardRatePerSecond;
        if (remaining == 0 || totalRewardsPaid + remaining > REWARD_BUDGET_CAP) {
            revert RewardBudgetExceeded();
        }

        rewardRatePerSecond = remaining / duration;
        periodFinish = block.timestamp + duration;
        lastUpdateTime = block.timestamp;
        emit RewardScheduleChanged(rewardRatePerSecond, periodFinish);
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = _lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = Math.mulDiv(
                stakedBalance[account],
                rewardPerTokenStored - _userRewardPerTokenPaid[account],
                REWARD_PRECISION
            ) + rewards[account];
            _userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function _lastTimeRewardApplicable() private view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }
}