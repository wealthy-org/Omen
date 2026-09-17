// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

enum MarketStatus {
    OPEN,
    CLOSED,
    RESOLVED,
    SETTLED,
    VOID
}

enum Outcome {
    UNRESOLVED,
    AGREE,
    DISAGREE,
    VOID
}

enum ResolutionType {
    PRICE_ABOVE,
    PRICE_BELOW,
    RELATIVE_PERFORMANCE
}

struct ResolutionConfig {
    ResolutionType resType;
    address assetAFeed;
    address assetBFeed;
    int256 targetPrice;
    uint256 startTimestamp;
    uint256 endTimestamp;
}
