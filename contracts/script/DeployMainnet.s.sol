// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {ProofSpring} from "../ProofSpring.sol";

/// @notice Deploys ProofSpring to Arc Mainnet
///
/// Usage:
///   export ARC_MAINNET_RPC_URL="https://rpc.mainnet.arc.io"
///   export PRIVATE_KEY="0x..."
///   export ADMIN_ADDRESS="0x..."
///   export REQUIRED_APPROVALS="1"
///
/// Dry-run:
///   forge script script/DeployMainnet.s.sol --rpc-url $ARC_MAINNET_RPC_URL
///
/// Broadcast:
///   forge script script/DeployMainnet.s.sol --rpc-url $ARC_MAINNET_RPC_URL --broadcast
contract DeployMainnet is Script {
    // Arc native USDC ERC-20 predeploy (same across all Arc networks)
    address public constant ARC_USDC = 0x3600000000000000000000000000000000000000;

    function run() external returns (ProofSpring deployedContract) {
        address initialAdmin = vm.envAddress("ADMIN_ADDRESS");
        uint256 requiredApprovals = vm.envOr("REQUIRED_APPROVALS", uint256(1));

        vm.startBroadcast();
        deployedContract = new ProofSpring(
            ARC_USDC,
            initialAdmin,
            requiredApprovals
        );
        vm.stopBroadcast();
    }
}
