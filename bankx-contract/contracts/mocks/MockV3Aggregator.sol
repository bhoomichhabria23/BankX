// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MockV3Aggregator is Ownable {
    uint8 public immutable decimals;
    uint80 public roundId;
    int256 public answer;
    uint256 public updatedAt;

    constructor(uint8 decimals_, int256 initialAnswer, address initialOwner) Ownable(initialOwner) {
        decimals = decimals_;
        _setAnswer(initialAnswer);
    }

    function latestRoundData()
        external
        view
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (roundId, answer, updatedAt, updatedAt, roundId);
    }

    function setAnswer(int256 nextAnswer) external onlyOwner {
        _setAnswer(nextAnswer);
    }

    function setUpdatedAt(uint256 timestamp) external onlyOwner {
        updatedAt = timestamp;
    }

    function _setAnswer(int256 nextAnswer) private {
        roundId += 1;
        answer = nextAnswer;
        updatedAt = block.timestamp;
    }
}