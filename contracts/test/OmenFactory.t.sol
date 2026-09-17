// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {OmenFactory} from "../src/OmenFactory.sol";
import {IOmenFactory} from "../src/interfaces/IOmenFactory.sol";
import {ResolutionType, ResolutionConfig, Outcome, MarketStatus} from "../src/types/MarketTypes.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

contract OmenFactoryTest is Test {
    OmenFactory public factory;
    address public admin = address(0xAD01);
    address public creator = address(0xCA01);
    address public resolver = address(0x8E50);
    address public unauthorizedUser = address(0xDEAD);

    event MarketCreated(
        uint256 indexed marketId,
        address indexed marketAddress,
        bytes32 indexed beliefHash,
        uint256 closeTime
    );

    function setUp() public {
        vm.startPrank(admin);
        factory = new OmenFactory();
        factory.grantRole(factory.MARKET_CREATOR_ROLE(), creator);
        factory.grantRole(factory.RESOLVER_ROLE(), resolver);
        vm.stopPrank();
    }

    function test_InitialRoles() public view {
        assertTrue(factory.hasRole(factory.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(factory.hasRole(factory.MARKET_CREATOR_ROLE(), creator));
        assertTrue(factory.hasRole(factory.RESOLVER_ROLE(), resolver));
        assertFalse(factory.hasRole(factory.MARKET_CREATOR_ROLE(), unauthorizedUser));
        assertEq(factory.totalMarkets(), 0);
    }

    function test_CreateMarket_Success() public {
        bytes32 beliefHash = keccak256(abi.encodePacked("ETH will flip BTC"));
        bytes32 sourceHash = keccak256(abi.encodePacked("https://x.com/post/1"));
        bytes32 resolutionHash = keccak256(abi.encodePacked("Chainlink ETH/USD > BTC/USD"));
        uint256 openTime = block.timestamp;
        uint256 closeTime = block.timestamp + 7 days;

        ResolutionConfig memory config = ResolutionConfig({
            resType: ResolutionType.PRICE_ABOVE,
            assetAFeed: address(0x1111),
            assetBFeed: address(0),
            targetPrice: 5000e8,
            startTimestamp: openTime,
            endTimestamp: closeTime
        });

        vm.prank(creator);
        address marketAddr = factory.createMarket(
            beliefHash,
            sourceHash,
            resolutionHash,
            openTime,
            closeTime,
            config
        );

        assertTrue(marketAddr != address(0));
        assertEq(factory.totalMarkets(), 1);
        assertEq(factory.getMarket(1), marketAddr);
        assertTrue(factory.isMarketValid(marketAddr));
    }

    function test_CreateMarket_RevertUnauthorized() public {
        bytes32 beliefHash = keccak256(abi.encodePacked("ETH will flip BTC"));
        bytes32 sourceHash = keccak256(abi.encodePacked("https://x.com/post/1"));
        bytes32 resolutionHash = keccak256(abi.encodePacked("Chainlink ETH/USD > BTC/USD"));
        uint256 openTime = block.timestamp;
        uint256 closeTime = block.timestamp + 7 days;

        ResolutionConfig memory config = ResolutionConfig({
            resType: ResolutionType.PRICE_ABOVE,
            assetAFeed: address(0x1111),
            assetBFeed: address(0),
            targetPrice: 5000e8,
            startTimestamp: openTime,
            endTimestamp: closeTime
        });

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        factory.createMarket(
            beliefHash,
            sourceHash,
            resolutionHash,
            openTime,
            closeTime,
            config
        );
    }

    function test_CreateMarket_RevertInvalidTiming() public {
        bytes32 beliefHash = keccak256(abi.encodePacked("ETH will flip BTC"));
        bytes32 sourceHash = keccak256(abi.encodePacked("https://x.com/post/1"));
        bytes32 resolutionHash = keccak256(abi.encodePacked("Chainlink ETH/USD > BTC/USD"));
        uint256 openTime = block.timestamp + 7 days;
        uint256 closeTime = block.timestamp;

        ResolutionConfig memory config = ResolutionConfig({
            resType: ResolutionType.PRICE_ABOVE,
            assetAFeed: address(0x1111),
            assetBFeed: address(0),
            targetPrice: 5000e8,
            startTimestamp: openTime,
            endTimestamp: closeTime
        });

        vm.prank(creator);
        vm.expectRevert();
        factory.createMarket(
            beliefHash,
            sourceHash,
            resolutionHash,
            openTime,
            closeTime,
            config
        );
    }

    function test_CreateMarket_RevertEmptyBeliefHash() public {
        bytes32 beliefHash = bytes32(0);
        bytes32 sourceHash = keccak256(abi.encodePacked("https://x.com/post/1"));
        bytes32 resolutionHash = keccak256(abi.encodePacked("Chainlink ETH/USD > BTC/USD"));
        uint256 openTime = block.timestamp;
        uint256 closeTime = block.timestamp + 7 days;

        ResolutionConfig memory config = ResolutionConfig({
            resType: ResolutionType.PRICE_ABOVE,
            assetAFeed: address(0x1111),
            assetBFeed: address(0),
            targetPrice: 5000e8,
            startTimestamp: openTime,
            endTimestamp: closeTime
        });

        vm.prank(creator);
        vm.expectRevert();
        factory.createMarket(
            beliefHash,
            sourceHash,
            resolutionHash,
            openTime,
            closeTime,
            config
        );
    }

    function test_CreateMultipleMarkets() public {
        vm.startPrank(creator);
        for (uint256 i = 1; i <= 3; i++) {
            bytes32 beliefHash = keccak256(abi.encodePacked("Belief", i));
            bytes32 sourceHash = keccak256(abi.encodePacked("Source", i));
            bytes32 resolutionHash = keccak256(abi.encodePacked("Res", i));
            uint256 openTime = block.timestamp;
            uint256 closeTime = block.timestamp + (i * 1 days);

            ResolutionConfig memory config = ResolutionConfig({
                resType: ResolutionType.PRICE_ABOVE,
                assetAFeed: address(0x1111),
                assetBFeed: address(0),
                targetPrice: int256(i * 1000e8),
                startTimestamp: openTime,
                endTimestamp: closeTime
            });

            address mAddr = factory.createMarket(
                beliefHash,
                sourceHash,
                resolutionHash,
                openTime,
                closeTime,
                config
            );

            assertEq(factory.totalMarkets(), i);
            assertEq(factory.getMarket(i), mAddr);
            assertTrue(factory.isMarketValid(mAddr));
        }
        vm.stopPrank();
    }
}
