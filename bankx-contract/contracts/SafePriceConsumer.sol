// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPriceConsumerAggregatorV3 {
    function decimals() external view returns (uint8);

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract SafePriceConsumer {
    IPriceConsumerAggregatorV3 public immutable feed;
    uint8 public immutable feedDecimals;
    uint256 public immutable maxAge;

    error InvalidFeedConfiguration();
    error InvalidPriceAnswer();
    error InvalidUpdatedAt();
    error StalePrice(uint256 updatedAt, uint256 currentTime);

    constructor(address feedAddress, uint256 maxAge_) {
        if (feedAddress == address(0) || feedAddress.code.length == 0 || maxAge_ == 0) {
            revert InvalidFeedConfiguration();
        }

        uint8 decimals_ = IPriceConsumerAggregatorV3(feedAddress).decimals();
        if (decimals_ > 18) revert InvalidFeedConfiguration();

        feed = IPriceConsumerAggregatorV3(feedAddress);
        feedDecimals = decimals_;
        maxAge = maxAge_;
    }

    function safePrice() public view returns (uint256 price18) {
        (uint80 roundId, int256 answer,, uint256 updatedAt, uint80 answeredInRound) =
            feed.latestRoundData();

        if (answer <= 0 || roundId == 0 || answeredInRound < roundId) {
            revert InvalidPriceAnswer();
        }
        if (updatedAt == 0 || updatedAt > block.timestamp) revert InvalidUpdatedAt();
        if (block.timestamp - updatedAt > maxAge) {
            revert StalePrice(updatedAt, block.timestamp);
        }

        price18 = uint256(answer) * 10 ** (18 - feedDecimals);
    }

    function valueOf(uint256 amount) external view returns (uint256) {
        return (amount * safePrice()) / 1e18;
    }
}
