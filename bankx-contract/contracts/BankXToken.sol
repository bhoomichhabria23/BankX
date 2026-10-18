// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Checkpoints} from "@openzeppelin/contracts/utils/structs/Checkpoints.sol";

contract BankXToken is ERC20, ERC20Permit, Ownable {
    using Checkpoints for Checkpoints.Trace256;

    uint256 public constant INITIAL_SUPPLY = 1_000_000 ether;
    uint256 public constant MIN_GOVERNANCE_BALANCE = 100 ether;

    mapping(address account => bool) public governanceExcluded;
    mapping(address account => Checkpoints.Trace256) private _votingPowerCheckpoints;
    Checkpoints.Trace256 private _eligibleSupplyCheckpoints;
    uint256 public eligibleVotingSupply;

    error ZeroTreasuryAddress();
    error FutureLookup(uint256 requestedTimepoint, uint256 currentTimepoint);

    event GovernanceExclusionUpdated(address indexed account, bool excluded);

    constructor(address treasury, address initialOwner)
        ERC20("BankX", "BANK")
        ERC20Permit("BankX")
        Ownable(initialOwner)
    {
        if (treasury == address(0)) revert ZeroTreasuryAddress();
        _mint(treasury, INITIAL_SUPPLY);
    }

    function clock() public view returns (uint48) {
        return uint48(block.number);
    }

    function CLOCK_MODE() public pure returns (string memory) {
        return "mode=blocknumber&from=default";
    }

    function getVotes(address account) external view returns (uint256) {
        return _eligiblePower(account);
    }

    function getPastVotes(address account, uint256 timepoint) external view returns (uint256) {
        _requirePastTimepoint(timepoint);
        return _votingPowerCheckpoints[account].upperLookup(timepoint);
    }

    function getPastTotalSupply(uint256 timepoint) external view returns (uint256) {
        _requirePastTimepoint(timepoint);
        return _eligibleSupplyCheckpoints.upperLookup(timepoint);
    }

    function setGovernanceExcluded(address account, bool excluded) external onlyOwner {
        require(account != address(0), "Zero account");
        require(governanceExcluded[account] != excluded, "No change");

        uint256 priorPower = _eligiblePower(account);
        governanceExcluded[account] = excluded;
        uint256 nextPower = _eligiblePower(account);

        eligibleVotingSupply = eligibleVotingSupply - priorPower + nextPower;
        _votingPowerCheckpoints[account].push(clock(), nextPower);
        _eligibleSupplyCheckpoints.push(clock(), eligibleVotingSupply);

        emit GovernanceExclusionUpdated(account, excluded);
    }

    function _update(address from, address to, uint256 value) internal override {
        uint256 fromPriorPower = from == address(0) ? 0 : _eligiblePower(from);
        uint256 toPriorPower = to == address(0) || to == from ? 0 : _eligiblePower(to);

        super._update(from, to, value);

        uint256 fromNextPower = from == address(0) ? 0 : _eligiblePower(from);
        uint256 toNextPower = to == address(0) || to == from ? 0 : _eligiblePower(to);

        if (from != address(0)) {
            _votingPowerCheckpoints[from].push(clock(), fromNextPower);
        }
        if (to != address(0) && to != from) {
            _votingPowerCheckpoints[to].push(clock(), toNextPower);
        }

        eligibleVotingSupply = eligibleVotingSupply
            - fromPriorPower
            - toPriorPower
            + fromNextPower
            + toNextPower;
        _eligibleSupplyCheckpoints.push(clock(), eligibleVotingSupply);
    }

    function _eligiblePower(address account) private view returns (uint256) {
        if (account == address(0) || governanceExcluded[account]) return 0;

        uint256 balance = balanceOf(account);
        return balance >= MIN_GOVERNANCE_BALANCE ? balance : 0;
    }

    function _requirePastTimepoint(uint256 timepoint) private view {
        uint256 currentTimepoint = clock();
        if (timepoint >= currentTimepoint) {
            revert FutureLookup(timepoint, currentTimepoint);
        }
    }
}