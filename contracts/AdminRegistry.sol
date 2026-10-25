// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IAdminRegistry {
    function isAdmin(address account) external view returns (bool);
}

/// @title AdminRegistry - Shared admin registration and on-chain verification for Fundora
/// @notice Allows users to register as Fundora admins by paying a fee in Arc USDC
contract AdminRegistry is IAdminRegistry, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct AdminProfile {
        string arcHouseUsername;
        string orgName;
        string grantDescription;
        uint128 estimatedBudget;
        uint32 numWinners;
        string prizePoolDetails;
        uint40 registeredAt;
        uint128 feePaid;
    }

    error ZeroAddress();
    error ZeroAmount();
    error AlreadyRegistered();
    error NotRegistered();
    error NotOwner();
    error EmptyField();

    event AdminRegistered(
        address indexed admin,
        string arcHouseUsername,
        string orgName,
        uint128 feePaid,
        uint40 registeredAt
    );
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event RegistrationFeeUpdated(uint128 oldFee, uint128 newFee);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    IERC20 public immutable usdc;
    address public owner;
    address public treasury;
    uint128 public registrationFee;

    mapping(address => bool) public override isAdmin;
    mapping(address => AdminProfile) public adminProfiles;
    address[] public registeredAdmins;

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _usdc, address _initialTreasury, uint128 _registrationFee) {
        if (_usdc == address(0) || _initialTreasury == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
        owner = msg.sender;
        treasury = _initialTreasury;
        registrationFee = _registrationFee;
    }

    /// @notice Register as a Fundora admin by paying the registration fee in USDC
    /// @param arcHouseUsername The applicant's Arc House username
    /// @param orgName Organization or project name
    /// @param grantDescription Description and purpose of the grant program
    /// @param estimatedBudget Estimated total grant budget in USDC (6 decimals)
    /// @param numWinners Optional target number of winning builders/teams (0 if open-ended)
    /// @param prizePoolDetails Optional distribution details
    function registerAdmin(
        string calldata arcHouseUsername,
        string calldata orgName,
        string calldata grantDescription,
        uint128 estimatedBudget,
        uint32 numWinners,
        string calldata prizePoolDetails
    ) external nonReentrant {
        if (isAdmin[msg.sender]) revert AlreadyRegistered();
        if (
            bytes(arcHouseUsername).length == 0 ||
            bytes(orgName).length == 0 ||
            bytes(grantDescription).length == 0
        ) {
            revert EmptyField();
        }
        if (estimatedBudget == 0) revert ZeroAmount();

        if (registrationFee > 0) {
            usdc.safeTransferFrom(msg.sender, treasury, registrationFee);
        }

        isAdmin[msg.sender] = true;
        adminProfiles[msg.sender] = AdminProfile({
            arcHouseUsername: arcHouseUsername,
            orgName: orgName,
            grantDescription: grantDescription,
            estimatedBudget: estimatedBudget,
            numWinners: numWinners,
            prizePoolDetails: prizePoolDetails,
            registeredAt: uint40(block.timestamp),
            feePaid: registrationFee
        });
        registeredAdmins.push(msg.sender);

        emit AdminRegistered(
            msg.sender,
            arcHouseUsername,
            orgName,
            registrationFee,
            uint40(block.timestamp)
        );
    }

    /// @notice Total count of registered admins
    function adminCount() external view returns (uint256) {
        return registeredAdmins.length;
    }

    /// @notice Retrieve all registered admin addresses
    function getRegisteredAdmins() external view returns (address[] memory) {
        return registeredAdmins;
    }

    /// @notice Retrieve an admin's complete profile
    function getAdminProfile(address admin) external view returns (AdminProfile memory) {
        if (!isAdmin[admin]) revert NotRegistered();
        return adminProfiles[admin];
    }

    /// @notice Update the fee recipient address
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address old = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(old, newTreasury);
    }

    /// @notice Update the registration fee
    function setRegistrationFee(uint128 newFee) external onlyOwner {
        uint128 old = registrationFee;
        registrationFee = newFee;
        emit RegistrationFeeUpdated(old, newFee);
    }

    /// @notice Transfer contract ownership
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address old = owner;
        owner = newOwner;
        emit OwnershipTransferred(old, newOwner);
    }
}
