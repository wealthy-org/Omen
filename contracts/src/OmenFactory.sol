// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IOmenFactory} from "./interfaces/IOmenFactory.sol";
import {OmenMarket} from "./OmenMarket.sol";
import {ResolutionConfig} from "./types/MarketTypes.sol";

contract OmenFactory is IOmenFactory, AccessControl {
    bytes32 public constant MARKET_CREATOR_ROLE = keccak256("MARKET_CREATOR_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");

    mapping(uint256 => address) public override getMarket;
    mapping(address => bool) public override isMarketValid;
    uint256 public override totalMarkets;

    error EmptyBeliefHash();
    error InvalidTiming();
    error MarketNotFound();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MARKET_CREATOR_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
    }

    function createMarket(
        bytes32 beliefHash,
        bytes32 sourceHash,
        bytes32 resolutionHash,
        uint256 openTime,
        uint256 closeTime,
        ResolutionConfig calldata config
    ) external override onlyRole(MARKET_CREATOR_ROLE) returns (address marketAddress) {
        if (beliefHash == bytes32(0)) {
            revert EmptyBeliefHash();
        }
        if (closeTime <= openTime) {
            revert InvalidTiming();
        }

        totalMarkets++;
        uint256 newMarketId = totalMarkets;

        OmenMarket newMarket = new OmenMarket(
            newMarketId,
            address(this),
            beliefHash,
            sourceHash,
            resolutionHash,
            openTime,
            closeTime,
            config
        );

        marketAddress = address(newMarket);
        getMarket[newMarketId] = marketAddress;
        isMarketValid[marketAddress] = true;

        emit MarketCreated(
            newMarketId,
            marketAddress,
            beliefHash,
            closeTime
        );
    }
}
