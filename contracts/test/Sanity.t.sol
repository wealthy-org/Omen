// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract SanityTest is Test {
    function setUp() public {}

    function test_SanityEnvironment() public pure {
        uint256 expected = 11155111;
        uint256 actual = 11155111;
        assertEq(expected, actual);
    }

    function test_OpenZeppelinImports() public pure {
        string memory converted = Strings.toString(46630);
        assertEq(converted, "46630");
    }
}
