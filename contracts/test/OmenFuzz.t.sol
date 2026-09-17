// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {OmenFactory} from "../src/OmenFactory.sol";
import {OmenMarket} from "../src/OmenMarket.sol";
import {ResolutionType, ResolutionConfig, Outcome, MarketStatus} from "../src/types/MarketTypes.sol";
import {TestHelpers} from "./helpers/TestHelpers.sol";

contract OmenFuzzTest is Test {
    TestHelpers public helpers;
    OmenFactory public factory;
    OmenMarket public market;

    address public admin = address(0xAD01);
    address public creator = address(0xCA01);
    address public resolver = address(0x8E50);
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    uint256 public openTime;
    uint256 public closeTime;

    function setUp() public {
        helpers = new TestHelpers();
        vm.startPrank(admin);
        factory = helpers.deployFactory(admin, creator, resolver);
        vm.stopPrank();

        openTime = block.timestamp;
        closeTime = block.timestamp + 7 days;

        ResolutionConfig memory config = helpers.createSampleConfig(
            ResolutionType.PRICE_ABOVE,
            address(0x1111),
            address(0),
            5000e8,
            openTime,
            closeTime
        );

        vm.prank(creator);
        address marketAddr = factory.createMarket(
            keccak256("Belief Fuzz"),
            keccak256("Source Fuzz"),
            keccak256("Resolution Fuzz"),
            openTime,
            closeTime,
            config
        );

        market = OmenMarket(marketAddr);
    }

    function testFuzz_DepositAndPayoutProportions(uint96 amountAgree, uint96 amountDisagree) public {
        vm.assume(amountAgree > 1000 wei && amountAgree < 100 ether);
        vm.assume(amountDisagree > 1000 wei && amountDisagree < 100 ether);

        vm.deal(alice, amountAgree);
        vm.deal(bob, amountDisagree);

        vm.prank(alice);
        market.depositAgree{value: amountAgree}();

        vm.prank(bob);
        market.depositDisagree{value: amountDisagree}();

        assertEq(address(market).balance, uint256(amountAgree) + uint256(amountDisagree));
        assertEq(market.agreePool(), amountAgree);
        assertEq(market.disagreePool(), amountDisagree);

        vm.warp(closeTime + 1);

        vm.prank(resolver);
        market.resolveMarket(Outcome.AGREE);

        uint256 aliceBalBefore = alice.balance;
        vm.prank(alice);
        market.claimPayout();
        uint256 aliceBalAfter = alice.balance;

        uint256 expectedPayout = (uint256(amountAgree) * (uint256(amountAgree) + uint256(amountDisagree))) / uint256(amountAgree);
        assertEq(aliceBalAfter - aliceBalBefore, expectedPayout);
        assertEq(address(market).balance, (uint256(amountAgree) + uint256(amountDisagree)) - expectedPayout);
    }

    function test_ZeroOpposingPool_AgreeWon() public {
        uint256 depositAmt = 5 ether;
        vm.deal(alice, depositAmt);

        vm.prank(alice);
        market.depositAgree{value: depositAmt}();

        assertEq(market.agreePool(), depositAmt);
        assertEq(market.disagreePool(), 0);

        vm.warp(closeTime + 1);

        vm.prank(resolver);
        market.resolveMarket(Outcome.AGREE);

        uint256 aliceBalBefore = alice.balance;
        vm.prank(alice);
        market.claimPayout();
        uint256 aliceBalAfter = alice.balance;

        assertEq(aliceBalAfter - aliceBalBefore, depositAmt);
        assertEq(address(market).balance, 0);
    }

    function test_ZeroOpposingPool_DisagreeWon() public {
        uint256 depositAmt = 4 ether;
        vm.deal(bob, depositAmt);

        vm.prank(bob);
        market.depositDisagree{value: depositAmt}();

        assertEq(market.agreePool(), 0);
        assertEq(market.disagreePool(), depositAmt);

        vm.warp(closeTime + 1);

        vm.prank(resolver);
        market.resolveMarket(Outcome.DISAGREE);

        uint256 bobBalBefore = bob.balance;
        vm.prank(bob);
        market.claimPayout();
        uint256 bobBalAfter = bob.balance;

        assertEq(bobBalAfter - bobBalBefore, depositAmt);
        assertEq(address(market).balance, 0);
    }

    function test_Invariant_ContractBalanceAlwaysMatchesPools() public {
        vm.deal(alice, 10 ether);
        vm.deal(bob, 15 ether);

        vm.prank(alice);
        market.depositAgree{value: 3 ether}();
        assertEq(address(market).balance, market.agreePool() + market.disagreePool());

        vm.prank(bob);
        market.depositDisagree{value: 7 ether}();
        assertEq(address(market).balance, market.agreePool() + market.disagreePool());

        vm.prank(alice);
        market.depositAgree{value: 2 ether}();
        assertEq(address(market).balance, market.agreePool() + market.disagreePool());
    }

    function test_NoArbitraryAdminWithdrawal() public {
        vm.deal(alice, 5 ether);
        vm.prank(alice);
        market.depositAgree{value: 5 ether}();

        vm.prank(admin);
        (bool success, ) = address(market).call(abi.encodeWithSignature("withdraw(uint256)", 5 ether));
        assertFalse(success);

        vm.prank(admin);
        (bool success2, ) = address(market).call(abi.encodeWithSignature("adminWithdraw()"));
        assertFalse(success2);

        assertEq(address(market).balance, 5 ether);
    }
}
