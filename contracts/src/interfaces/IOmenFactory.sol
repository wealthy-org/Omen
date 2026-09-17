// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ResolutionConfig} from "../types/MarketTypes.sol";

interface IOmenFactory {
    event MarketCreated(
        uint256 indexed marketId,
        address indexed marketAddress,
        bytes32 indexed beliefHash,
        uint256 closeTime
    );

    function createMarket(
        bytes32 beliefHash,
        bytes32 sourceHash,
        bytes32 resolutionHash,
        uint256 openTime,
        uint256 closeTime,
        ResolutionConfig calldata config
    ) external returns (address marketAddress);

    function getMarket(uint256 marketId) external view returns (address);

    function totalMarkets() external view returns (uint256);

    function isMarketValid(address marketAddress) external view returns (bool);
}
