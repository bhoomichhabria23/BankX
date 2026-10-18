// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract BankXUsdcVault is ERC4626 {
    error InvalidUsdcToken();

    constructor(IERC20 usdc)
        ERC20("BankX USDC Vault Share", "bxUSDC")
        ERC4626(usdc)
    {
        if (address(usdc) == address(0) || IERC20Metadata(address(usdc)).decimals() != 6) {
            revert InvalidUsdcToken();
        }
    }
}
