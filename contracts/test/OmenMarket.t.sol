// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {OmenFactory} from "../src/OmenFactory.sol";
import {OmenMarket} from "../src/OmenMarket.sol";
import {IOmenMarket} from "../src/interfaces/IOmenMarket.sol";
import {ResolutionType, ResolutionConfig, Outcome, MarketStatus} from "../src/types/MarketTypes.sol";

contract OmenMarketTest is Test {
    OmenFactory public factory;
    OmenMarket public market;

    address public admin = address(0xAD01);
    address public creator = address(0xCA01);
    address public resolver = address(0x8E50);
    address public user1 = address(0x1001);
    address public user2 = address(0x1002);
    address public user3 = address(0x1003);
    address public user4 = address(0x1004);

    uint256 public openTime;
    uint256 public closeTime;

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

    function setUp() public {
        vm.deal(admin, 100 ether);
        vm.deal(creator, 100 ether);
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
        vm.deal(user4, 100 ether);

        vm.startPrank(admin);
        factory = new OmenFactory();
        factory.grantRole(factory.MARKET_CREATOR_ROLE(), creator);
        factory.grantRole(factory.RESOLVER_ROLE(), resolver);
        vm.stopPrank();

        openTime = block.timestamp;
        closeTime = block.timestamp + 7 days;

        ResolutionConfig memory config = ResolutionConfig({
            resType: ResolutionType.PRICE_ABOVE,
            assetAFeed: address(0x1111),
            assetBFeed: address(0),
            targetPrice: 5000e8,
            startTimestamp: openTime,
            endTimestamp: closeTime
        });

        bytes32 beliefHash = keccak256("Belief Statement");
        bytes32 sourceHash = keccak256("Source URL");
        bytes32 resolutionHash = keccak256("Resolution Oracle");

        vm.prank(creator);
        address marketAddr = factory.createMarket(
            beliefHash,
            sourceHash,
            resolutionHash,
            openTime,
            closeTime,
            config
        );

        market = OmenMarket(marketAddr);
    }

    function test_MarketInitialization() public view {
        assertEq(market.marketId(), 1);
        assertEq(market.factory(), address(factory));
        assertEq(uint8(market.status()), uint8(MarketStatus.OPEN));
        assertEq(uint8(market.winner()), uint8(Outcome.UNRESOLVED));
        assertEq(market.agreePool(), 0);
        assertEq(market.disagreePool(), 0);
        assertEq(market.openTime(), openTime);
        assertEq(market.closeTime(), closeTime);
    }

    function test_DepositAgree_Success() public {
        vm.prank(user1);
        market.depositAgree{value: 2 ether}();

        assertEq(market.agreePositions(user1), 2 ether);
        assertEq(market.agreePool(), 2 ether);
        assertEq(market.disagreePool(), 0);
        assertEq(address(market).balance, 2 ether);
    }

    function test_DepositDisagree_Success() public {
        vm.prank(user2);
        market.depositDisagree{value: 3 ether}();

        assertEq(market.disagreePositions(user2), 3 ether);
        assertEq(market.disagreePool(), 3 ether);
        assertEq(market.agreePool(), 0);
        assertEq(address(market).balance, 3 ether);
    }

    function test_Deposit_RevertZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert();
        market.depositAgree{value: 0}();

        vm.prank(user2);
        vm.expectRevert();
        market.depositDisagree{value: 0}();
    }

    function test_Deposit_RevertAfterCloseTime() public {
        vm.warp(closeTime + 1);

        vm.prank(user1);
        vm.expectRevert();
        market.depositAgree{value: 1 ether}();

        vm.prank(user2);
        vm.expectRevert();
        market.depositDisagree{value: 1 ether}();
    }

    function test_ResolveMarket_RevertBeforeCloseTime() public {
        vm.prank(user1);
        market.depositAgree{value: 1 ether}();

        vm.prank(address(factory));
        vm.expectRevert();
        market.resolveMarket(Outcome.AGREE);
    }

    function test_ResolveMarket_RevertUnauthorized() public {
        vm.prank(user1);
        market.depositAgree{value: 1 ether}();

        vm.warp(closeTime + 1);

        vm.prank(user1);
        vm.expectRevert();
        market.resolveMarket(Outcome.AGREE);
    }

    function test_ResolveMarket_AgreeWinner_AndClaimPayout() public {
        vm.prank(user1);
        market.depositAgree{value: 2 ether}();

        vm.prank(user2);
        market.depositAgree{value: 1 ether}();

        vm.prank(user3);
        market.depositDisagree{value: 3 ether}();

        assertEq(market.agreePool(), 3 ether);
        assertEq(market.disagreePool(), 3 ether);
        assertEq(address(market).balance, 6 ether);

        vm.warp(closeTime + 1);

        vm.prank(address(factory));
        market.resolveMarket(Outcome.AGREE);

        assertEq(uint8(market.status()), uint8(MarketStatus.RESOLVED));
        assertEq(uint8(market.winner()), uint8(Outcome.AGREE));

        uint256 user1BalanceBefore = user1.balance;
        vm.prank(user1);
        market.claimPayout();
        uint256 user1BalanceAfter = user1.balance;
        assertEq(user1BalanceAfter - user1BalanceBefore, 4 ether);
        assertTrue(market.hasClaimed(user1));

        uint256 user2BalanceBefore = user2.balance;
        vm.prank(user2);
        market.claimPayout();
        uint256 user2BalanceAfter = user2.balance;
        assertEq(user2BalanceAfter - user2BalanceBefore, 2 ether);
        assertTrue(market.hasClaimed(user2));

        vm.prank(user3);
        vm.expectRevert();
        market.claimPayout();

        vm.prank(user1);
        vm.expectRevert();
        market.claimPayout();
    }

    function test_ResolveMarket_DisagreeWinner_AndClaimPayout() public {
        vm.prank(user1);
        market.depositAgree{value: 1 ether}();

        vm.prank(user2);
        market.depositDisagree{value: 3 ether}();

        vm.warp(closeTime + 1);

        vm.prank(address(factory));
        market.resolveMarket(Outcome.DISAGREE);

        uint256 user2BalanceBefore = user2.balance;
        vm.prank(user2);
        market.claimPayout();
        uint256 user2BalanceAfter = user2.balance;
        assertEq(user2BalanceAfter - user2BalanceBefore, 4 ether);
    }

    function test_VoidMarket_FullRefund() public {
        vm.prank(user1);
        market.depositAgree{value: 1.5 ether}();

        vm.prank(user2);
        market.depositDisagree{value: 2.5 ether}();

        vm.prank(address(factory));
        market.voidMarket();

        assertEq(uint8(market.status()), uint8(MarketStatus.VOID));
        assertEq(uint8(market.winner()), uint8(Outcome.VOID));

        uint256 user1BalanceBefore = user1.balance;
        vm.prank(user1);
        market.claimPayout();
        uint256 user1BalanceAfter = user1.balance;
        assertEq(user1BalanceAfter - user1BalanceBefore, 1.5 ether);

        uint256 user2BalanceBefore = user2.balance;
        vm.prank(user2);
        market.claimPayout();
        uint256 user2BalanceAfter = user2.balance;
        assertEq(user2BalanceAfter - user2BalanceBefore, 2.5 ether);

        vm.prank(user1);
        vm.expectRevert();
        market.claimPayout();

        vm.prank(user4);
        vm.expectRevert();
        market.claimPayout();
    }

    function test_ResolveMarket_ByResolverRoleAccount() public {
        vm.prank(user1);
        market.depositAgree{value: 1 ether}();

        vm.warp(closeTime + 1);

        vm.prank(resolver);
        market.resolveMarket(Outcome.AGREE);

        assertEq(uint8(market.status()), uint8(MarketStatus.RESOLVED));
        assertEq(uint8(market.winner()), uint8(Outcome.AGREE));
    }

    function test_VoidMarket_ByResolverRoleAccount() public {
        vm.prank(user1);
        market.depositAgree{value: 1 ether}();

        vm.prank(resolver);
        market.voidMarket();

        assertEq(uint8(market.status()), uint8(MarketStatus.VOID));
        assertEq(uint8(market.winner()), uint8(Outcome.VOID));
    }
}

