// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAggregatorV3 {
    function decimals() external view returns (uint8);

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

contract BankXPriceFeed {
    IAggregatorV3 public immutable feed;
    uint8 public immutable feedDecimals;
    uint256 public immutable maxStaleness;
    uint256 public immutable supportedChainId;

    error InvalidFeedConfiguration();
    error UnsupportedNetwork(uint256 expectedChainId, uint256 actualChainId);
    error InvalidPriceAnswer();
    error StalePrice(uint256 updatedAt, uint256 currentTime);

    constructor(address feedAddress, uint256 maxStaleness_, uint256 chainId_) {
        if (feedAddress == address(0) || feedAddress.code.length == 0 || maxStaleness_ == 0) {
            revert InvalidFeedConfiguration();
        }
        if (block.chainid != chainId_) revert UnsupportedNetwork(chainId_, block.chainid);

        uint8 decimals_ = IAggregatorV3(feedAddress).decimals();
        if (decimals_ > 18) revert InvalidFeedConfiguration();

        feed = IAggregatorV3(feedAddress);
        feedDecimals = decimals_;
        maxStaleness = maxStaleness_;
        supportedChainId = chainId_;
    }

    function latestEthUsd() external view returns (uint256 price18, uint256 updatedAt) {
        (uint80 roundId, int256 answer,, uint256 timestamp, uint80 answeredInRound) = feed.latestRoundData();
        if (answer <= 0 || roundId == 0 || answeredInRound < roundId) revert InvalidPriceAnswer();
        if (timestamp == 0 || timestamp > block.timestamp || block.timestamp - timestamp > maxStaleness) {
            revert StalePrice(timestamp, block.timestamp);
        }

        price18 = uint256(answer) * 10 ** (18 - feedDecimals);
        updatedAt = timestamp;
    }
}