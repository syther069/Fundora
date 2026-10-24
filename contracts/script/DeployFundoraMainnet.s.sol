// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Fundora} from "../Fundora.sol";

/// @notice Deployment script for Fundora on Arc Mainnet (Chain ID 5042)
/// Uses canonical Arc USDC predeploy at 0x3600000000000000000000000000000000000000 (6 decimals)
contract DeployFundoraMainnet is Script {
    address public constant CANONICAL_ARC_USDC = 0x3600000000000000000000000000000000000000;
    uint256 public constant DEFAULT_REQUIRED_APPROVALS = 1;

    function run() external returns (address deployedAddress) {
        address deployer = msg.sender;
        address initialAdmin = vm.envOr("INITIAL_ADMIN", deployer);
        uint256 requiredApprovals = vm.envOr("REQUIRED_APPROVALS", DEFAULT_REQUIRED_APPROVALS);

        console.log("Deploying Fundora to Arc Mainnet (Chain ID 5042)...");
        console.log("Canonical Arc USDC:", CANONICAL_ARC_USDC);
        console.log("Initial Admin:", initialAdmin);
        console.log("Required Approvals:", requiredApprovals);

        vm.startBroadcast();
        Fundora fundora = new Fundora(CANONICAL_ARC_USDC, initialAdmin, requiredApprovals);
        vm.stopBroadcast();

        deployedAddress = address(fundora);
        console.log("Fundora successfully deployed at:", deployedAddress);
        require(address(fundora.usdc()) == CANONICAL_ARC_USDC, "Deployed with wrong USDC token");
        require(fundora.admin() == initialAdmin, "Deployed with wrong admin");
        require(fundora.requiredApprovals() == requiredApprovals, "Deployed with wrong required approvals");
    }
}
