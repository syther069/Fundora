// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AdminRegistry} from "../AdminRegistry.sol";
import {Fundora} from "../Fundora.sol";

contract MockUSDC {
    string public name = "USD Coin";
    string public symbol = "USDC";
    uint8 public decimals = 6;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "ERC20: insufficient");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "ERC20: insufficient");
        require(allowance[from][msg.sender] >= amount, "ERC20: allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

contract AdminRegistryTest is Test {
    MockUSDC public usdc;
    AdminRegistry public registry;
    Fundora public fundora;

    address public deployer = address(0x1);
    address public treasury = address(0x2);
    address public applicant1 = address(0x10);
    address public applicant2 = address(0x20);
    address public reviewer1 = address(0x30);
    address public builder1 = address(0x40);

    uint128 public constant TESTNET_FEE = 10_000_000; // 10 USDC
    uint128 public constant MAINNET_FEE = 1_000_000;  // 1 USDC

    event AdminRegistered(
        address indexed admin,
        string arcHouseUsername,
        string orgName,
        uint128 feePaid,
        uint40 registeredAt
    );

    function setUp() public {
        vm.startPrank(deployer);
        usdc = new MockUSDC();
        // Set up registry with Testnet fee (10 USDC)
        registry = new AdminRegistry(address(usdc), treasury, TESTNET_FEE);
        // Set up Fundora with 1 required approval
        fundora = new Fundora(address(usdc), deployer, 1);
        fundora.setAdminRegistry(address(registry));
        fundora.addReviewer(reviewer1);
        vm.stopPrank();

        // Mint USDC to applicants
        usdc.mint(applicant1, 100_000_000); // 100 USDC
        usdc.mint(applicant2, 100_000_000);
    }

    function testRegisterAdminSuccess() public {
        vm.startPrank(applicant1);
        usdc.approve(address(registry), TESTNET_FEE);

        vm.expectEmit(true, false, false, true);
        emit AdminRegistered(applicant1, "alice_arc", "Alice Foundation", TESTNET_FEE, uint40(block.timestamp));

        registry.registerAdmin(
            "alice_arc",
            "Alice Foundation",
            "Funding public goods on Arc",
            5000_000_000, // 5,000 USDC budget
            3,            // 3 winners
            "Top 3 teams split 50/30/20"
        );
        vm.stopPrank();

        // Verify fee transfer
        assertEq(usdc.balanceOf(treasury), TESTNET_FEE);
        assertEq(usdc.balanceOf(applicant1), 100_000_000 - TESTNET_FEE);

        // Verify on-chain state
        assertTrue(registry.isAdmin(applicant1));
        assertEq(registry.adminCount(), 1);
        assertEq(registry.getRegisteredAdmins()[0], applicant1);

        AdminRegistry.AdminProfile memory profile = registry.getAdminProfile(applicant1);
        assertEq(profile.arcHouseUsername, "alice_arc");
        assertEq(profile.orgName, "Alice Foundation");
        assertEq(profile.grantDescription, "Funding public goods on Arc");
        assertEq(profile.estimatedBudget, 5000_000_000);
        assertEq(profile.numWinners, 3);
        assertEq(profile.prizePoolDetails, "Top 3 teams split 50/30/20");
        assertEq(profile.feePaid, TESTNET_FEE);
        assertEq(profile.registeredAt, uint40(block.timestamp));
    }

    function testCannotRegisterTwice() public {
        vm.startPrank(applicant1);
        usdc.approve(address(registry), 50_000_000);

        registry.registerAdmin("alice_arc", "Alice Org", "Description", 1000_000_000, 0, "");

        vm.expectRevert(AdminRegistry.AlreadyRegistered.selector);
        registry.registerAdmin("alice_arc_2", "Alice Org 2", "Description 2", 1000_000_000, 0, "");
        vm.stopPrank();
    }

    function testCannotRegisterWithInsufficientUSDC() public {
        address brokeApplicant = address(0x999);
        vm.startPrank(brokeApplicant);
        usdc.approve(address(registry), TESTNET_FEE);

        vm.expectRevert("ERC20: insufficient");
        registry.registerAdmin("broke", "No Org", "Desc", 1000_000_000, 0, "");
        vm.stopPrank();
    }

    function testCannotRegisterWithEmptyRequiredFields() public {
        vm.startPrank(applicant1);
        usdc.approve(address(registry), TESTNET_FEE);

        vm.expectRevert(AdminRegistry.EmptyField.selector);
        registry.registerAdmin("", "Org", "Desc", 1000_000_000, 0, "");

        vm.expectRevert(AdminRegistry.EmptyField.selector);
        registry.registerAdmin("user", "", "Desc", 1000_000_000, 0, "");

        vm.expectRevert(AdminRegistry.EmptyField.selector);
        registry.registerAdmin("user", "Org", "", 1000_000_000, 0, "");

        vm.expectRevert(AdminRegistry.ZeroAmount.selector);
        registry.registerAdmin("user", "Org", "Desc", 0, 0, "");
        vm.stopPrank();
    }

    function testMainnetFeeConfig() public {
        vm.prank(deployer);
        AdminRegistry mainnetRegistry = new AdminRegistry(address(usdc), treasury, MAINNET_FEE);

        vm.startPrank(applicant2);
        usdc.approve(address(mainnetRegistry), MAINNET_FEE);
        mainnetRegistry.registerAdmin("bob_arc", "Bob Labs", "Web3 grants", 2000_000_000, 1, "Winner takes all");
        vm.stopPrank();

        assertTrue(mainnetRegistry.isAdmin(applicant2));
        assertEq(usdc.balanceOf(treasury), MAINNET_FEE);
    }

    function testRegisteredAdminCanCreateGrantInFundora() public {
        // Register applicant1
        vm.startPrank(applicant1);
        usdc.approve(address(registry), TESTNET_FEE);
        registry.registerAdmin("alice_arc", "Alice Org", "Desc", 1000_000_000, 0, "");

        // Verify Fundora recognizes applicant1
        assertTrue(fundora.isAuthorizedAdmin(applicant1));

        // Create grant as applicant1
        string[] memory titles = new string[](1);
        titles[0] = "Milestone 1";
        string[] memory descs = new string[](1);
        descs[0] = "Deliver MVP";
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 50_000_000;

        uint256 grantId = fundora.createGrant(
            "Community Dev Grant",
            "Build awesome tooling",
            1,
            titles,
            descs,
            amounts,
            0
        );

        assertEq(grantId, 1);
        assertEq(fundora.grantCreator(1), applicant1);

        // Fund the grant as applicant1
        usdc.approve(address(fundora), 50_000_000);
        fundora.fundGrant(grantId);
        vm.stopPrank();

        Fundora.Grant memory g = fundora.getGrant(grantId);
        assertEq(uint8(g.status), 1); // Active
        assertEq(g.funder, applicant1);
    }

    function testAdminCannotManageOtherAdminsGrant() public {
        // Register applicant1
        vm.startPrank(applicant1);
        usdc.approve(address(registry), TESTNET_FEE);
        registry.registerAdmin("alice_arc", "Alice Org", "Desc", 1000_000_000, 0, "");

        string[] memory titles = new string[](1);
        titles[0] = "Milestone 1";
        string[] memory descs = new string[](1);
        descs[0] = "Deliver MVP";
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 50_000_000;

        uint256 grantId = fundora.createGrant("Grant 1", "Desc 1", 1, titles, descs, amounts, 0);
        vm.stopPrank();

        // Register applicant2
        vm.startPrank(applicant2);
        usdc.approve(address(registry), TESTNET_FEE);
        registry.registerAdmin("bob_arc", "Bob Org", "Desc", 1000_000_000, 0, "");

        // Applicant2 tries to cancel Grant 1 created by Applicant1 -> must revert
        vm.expectRevert(Fundora.NotAdmin.selector);
        fundora.cancelGrant(grantId);

        // Applicant2 tries to fund Grant 1 -> must revert
        usdc.approve(address(fundora), 50_000_000);
        vm.expectRevert(Fundora.NotAdmin.selector);
        fundora.fundGrant(grantId);
        vm.stopPrank();

        // Applicant1 CAN cancel their own grant
        vm.prank(applicant1);
        fundora.cancelGrant(grantId);

        Fundora.Grant memory g = fundora.getGrant(grantId);
        assertEq(uint8(g.status), 3); // Cancelled
    }

    function testNonAdminCannotCreateGrant() public {
        address rando = address(0x888);
        vm.startPrank(rando);
        string[] memory titles = new string[](1);
        titles[0] = "Milestone 1";
        string[] memory descs = new string[](1);
        descs[0] = "Deliver MVP";
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 50_000_000;

        vm.expectRevert(Fundora.NotAdmin.selector);
        fundora.createGrant("Illegal", "Desc", 1, titles, descs, amounts, 0);
        vm.stopPrank();
    }
}
