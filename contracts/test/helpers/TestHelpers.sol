// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OmenFactory} from "../../src/OmenFactory.sol";
import {OmenMarket} from "../../src/OmenMarket.sol";
import {ResolutionType, ResolutionConfig, Outcome} from "../../src/types/MarketTypes.sol";

contract TestHelpers {
    function deployFactory(address admin, address creator, address resolver) public returns (OmenFactory factory) {
        factory = new OmenFactory();
        factory.grantRole(factory.MARKET_CREATOR_ROLE(), creator);
        factory.grantRole(factory.RESOLVER_ROLE(), resolver);
    }

    function createSampleConfig(
        ResolutionType rType,
        address assetA,
        address assetB,
        int256 targetPrice,
        uint256 openTime,
        uint256 closeTime
    ) public pure returns (ResolutionConfig memory) {
        return ResolutionConfig({
            resType: rType,
            assetAFeed: assetA,
            assetBFeed: assetB,
            targetPrice: targetPrice,
            startTimestamp: openTime,
            endTimestamp: closeTime
        });
    }
}
