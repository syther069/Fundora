// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {AdminRegistry} from "../AdminRegistry.sol";
import {FundoraEvents} from "../FundoraEvents.sol";
import {Fundora} from "../Fundora.sol";

/// @title DeployMainnetSuite
/// @notice Deploys AdminRegistry and FundoraEvents to Arc Mainnet and links them with Fundora
///
/// Usage:
///   export ARC_MAINNET_RPC_URL="https://rpc.mainnet.arc.io"
///   export PRIVATE_KEY="0x..."
///   export TREASURY_ADDRESS="0x..."
///   export ADMIN_ADDRESS="0x..."
///
/// Dry-run:
///   forge script script/DeployMainnetSuite.s.sol --rpc-url $ARC_MAINNET_RPC_URL
///
/// Broadcast:
///   forge script script/DeployMainnetSuite.s.sol --rpc-url $ARC_MAINNET_RPC_URL --broadcast
contract DeployMainnetSuite is Script {
    // Arc native USDC ERC-20 predeploy
    address public constant ARC_USDC = 0x3600000000000000000000000000000000000000;
    // Current Fundora v1 contract on Arc Mainnet
    address public constant EXISTING_MAINNET_FUNDORA = 0x371b4b6894882082e706cd84b781bf749472a602;

    function run() external returns (AdminRegistry registry, FundoraEvents eventsContract) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);
        address platformAdmin = vm.envOr("ADMIN_ADDRESS", deployer);

        // 1 USDC fee on mainnet (6 decimals)
        uint128 registrationFee = 1_000_000;

        console2.log("=== Arc Mainnet Suite Deployment ===");
        console2.log("Chain ID:", block.chainid);
        console2.log("Deployer:", deployer);
        console2.log("Treasury:", treasury);
        console2.log("Platform Admin:", platformAdmin);
        console2.log("Registration Fee (raw):", registrationFee);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AdminRegistry
        registry = new AdminRegistry(ARC_USDC, treasury, registrationFee);
        console2.log("AdminRegistry deployed at:", address(registry));

        // 2. Deploy FundoraEvents (linked to AdminRegistry)
        eventsContract = new FundoraEvents(ARC_USDC, platformAdmin, address(registry));
        console2.log("FundoraEvents deployed at:", address(eventsContract));

        // 3. Link AdminRegistry in existing Fundora grants contract if deployer is admin
        try Fundora(EXISTING_MAINNET_FUNDORA).setAdminRegistry(address(registry)) {
            console2.log("Existing Fundora contract updated with AdminRegistry.");
        } catch {
            console2.log("Notice: Could not link to existing Fundora (deployer may not be initial admin). Link manually with setAdminRegistry.");
        }

        vm.stopBroadcast();
    }
}

