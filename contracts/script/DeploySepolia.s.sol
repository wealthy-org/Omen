// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {OmenFactory} from "../src/OmenFactory.sol";

contract DeploySepolia is Script {
    function run() external returns (OmenFactory factory) {
        uint256 deployerPrivateKey = vm.envOr("SEPOLIA_PRIVATE_KEY", vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)));

        vm.startBroadcast(deployerPrivateKey);
        factory = new OmenFactory();
        vm.stopBroadcast();

        console.log("OmenFactory deployed to:", address(factory));
    }
}
