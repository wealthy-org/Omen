// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MarketStatus, Outcome, ResolutionConfig} from "../types/MarketTypes.sol";

interface IOmenMarket {
    event PositionTaken(
        address indexed user,
        Outcome indexed side,
        uint256 amount,
        uint256 totalPool
    );

    event MarketClosed(uint256 indexed marketId, uint256 timestamp);

    event MarketResolved(
        uint256 indexed marketId,
        Outcome indexed outcome,
        uint256 timestamp
    );

    event PayoutClaimed(
        address indexed user,
        uint256 payoutAmount,
        uint256 timestamp
    );

    event MarketVoided(uint256 indexed marketId, uint256 timestamp);

    function depositAgree() external payable;

    function depositDisagree() external payable;

    function resolveMarket(Outcome outcome) external;

    function claimPayout() external;

    function voidMarket() external;

    function marketId() external view returns (uint256);

    function factory() external view returns (address);

    function resolver() external view returns (address);

    function beliefHash() external view returns (bytes32);

    function sourceHash() external view returns (bytes32);

    function resolutionHash() external view returns (bytes32);

    function openTime() external view returns (uint256);

    function closeTime() external view returns (uint256);

    function status() external view returns (MarketStatus);

    function winner() external view returns (Outcome);

    function agreePool() external view returns (uint256);

    function disagreePool() external view returns (uint256);

    function agreePositions(address user) external view returns (uint256);

    function disagreePositions(address user) external view returns (uint256);

    function hasClaimed(address user) external view returns (bool);
}
