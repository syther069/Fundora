// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {AdminRegistry} from "../AdminRegistry.sol";
import {Fundora} from "../Fundora.sol";

/// @notice Deploys AdminRegistry and Fundora v5 to Arc Testnet or Arc Mainnet
///
/// Usage for Arc Testnet (10 USDC fee):
///   forge script script/DeployAdminRegistry.s.sol:DeployAdminRegistry --rpc-url https://rpc.testnet.arc.io --broadcast
///
/// Usage for Arc Mainnet (1 USDC fee):
///   forge script script/DeployAdminRegistry.s.sol:DeployAdminRegistry --rpc-url https://rpc.mainnet.arc.io --broadcast
contract DeployAdminRegistry is Script {
    address public constant ARC_USDC = 0x3600000000000000000000000000000000000000;

    function run() external returns (AdminRegistry registry, Fundora fundora) {
        uint256 chainId = block.chainid;
        // Default fee: 10 USDC on testnet (5042002), 1 USDC on mainnet (5042)
        uint128 registrationFee = chainId == 5042 ? 1_000_000 : 10_000_000;

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);
        uint256 requiredApprovals = vm.envOr("REQUIRED_APPROVALS", uint256(1));

        console2.log("Deploying to chain ID:", chainId);
        console2.log("Deployer:", deployer);
        console2.log("Treasury:", treasury);
        console2.log("Registration Fee (raw):", registrationFee);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AdminRegistry
        registry = new AdminRegistry(ARC_USDC, treasury, registrationFee);
        console2.log("AdminRegistry deployed at:", address(registry));

        // 2. Deploy Fundora v5
        fundora = new Fundora(ARC_USDC, deployer, requiredApprovals);
        console2.log("Fundora v5 deployed at:", address(fundora));

        // 3. Link AdminRegistry in Fundora
        fundora.setAdminRegistry(address(registry));
        console2.log("Fundora AdminRegistry linked.");

        // 4. Add initial reviewer so grants can be funded immediately
        fundora.addReviewer(deployer);
        console2.log("Initial reviewer added:", deployer);

        vm.stopBroadcast();
    }
}
