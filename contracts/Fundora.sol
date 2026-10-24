// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Fundora is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum GrantStatus {
        Open,
        Active,
        Completed,
        Cancelled
    }

    enum MilestoneStatus {
        Pending,
        SubmittedForReview,
        Approved,
        Rejected
    }

    struct Grant {
        string title;
        string description;
        address funder;
        address builder;
        uint128 totalAmount;
        uint128 releasedAmount;
        uint8 milestoneCount;
        uint8 approvedMilestoneCount;
        GrantStatus status;
        uint40 createdAt;
        uint40 deadline;
    }

    struct Milestone {
        uint8 index;
        string title;
        string description;
        uint128 amount;
        MilestoneStatus status;
        address submittedBy;
        bytes32 evidenceHash;
        uint40 submittedAt;
        uint40 approvedAt;
    }

    struct VoteCount {
        uint128 approvals;
        uint128 rejections;
    }

    error NotAdmin();
    error NotReviewer();
    error NotBuilder();
    error AlreadyVoted();
    error InvalidGrant();
    error InvalidMilestone();
    error InvalidStatus();
    error ArrayLengthMismatch();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientApprovers();
    error Paused();
    error DeadlineExpired();
    error MaxMilestonesExceeded();
    error NoRefundDue();
    error AdminCannotBeBuilder();
    error NotExpired();
    error BatchTooLarge();

    event AdminSet(address indexed admin);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);
    event ReviewerAdded(address indexed reviewer);
    event ReviewerRemoved(address indexed reviewer);
    event RequiredApprovalsChanged(uint256 oldVal, uint256 newVal);
    event GrantCreated(uint256 indexed grantId, string title, address indexed creator);
    event GrantFunded(uint256 indexed grantId, uint256 amount, address indexed funder);
    event GrantApplied(uint256 indexed grantId, address indexed builder);
    event MilestoneSubmitted(
        uint256 indexed grantId,
        uint256 indexed milestoneIndex,
        string evidenceUri,
        address indexed builder
    );
    event MilestoneReviewCast(
        uint256 indexed grantId,
        uint256 indexed milestoneIndex,
        address indexed reviewer,
        bool approved
    );
    event MilestoneApproved(uint256 indexed grantId, uint256 indexed milestoneIndex, uint256 amount, address indexed builder);
    event MilestonePaymentQueued(uint256 indexed grantId, uint256 indexed milestoneIndex, uint256 amount, address indexed builder);
    event PaymentClaimed(address indexed builder, uint256 amount);
    event GrantCompleted(uint256 indexed grantId, address indexed builder);
    event GrantCancelled(uint256 indexed grantId, address indexed admin);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);
    event GrantExpired(uint256 indexed grantId);
    event BuilderReassigned(uint256 indexed grantId, address indexed oldBuilder, address indexed newBuilder);
    event FunderRefundQueued(uint256 indexed grantId, uint256 amount, address indexed funder);
    event FunderRefundClaimed(address indexed funder, uint256 amount);
    event GrantDeadlineSet(uint256 indexed grantId, uint40 deadline);

    uint8 public constant MAX_MILESTONES = 20;

    IERC20 public usdc;
    address public admin;
    uint256 public grantCount;
    uint256 public reviewerCount;
    uint256 public requiredApprovals;
    uint128 public totalFunded;
    bool public paused;

    mapping(address => bool) public isReviewer;
    mapping(uint256 => Grant) public grants;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => mapping(uint256 => uint256)) public milestoneRound;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => mapping(address => bool)))) public milestoneVotes;
    mapping(uint256 => mapping(uint256 => VoteCount)) public voteCounts;
    mapping(address => uint128) public pendingWithdrawals;
    mapping(address => uint128) public pendingFunderRefunds;

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyReviewer() {
        if (!isReviewer[msg.sender]) revert NotReviewer();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert Paused();
        _;
    }

    constructor(address _usdc, address _initialAdmin, uint256 _requiredApprovals) {
        if (_usdc == address(0) || _initialAdmin == address(0)) revert ZeroAddress();
        if (_requiredApprovals == 0) revert ZeroAmount();

        usdc = IERC20(_usdc);
        admin = _initialAdmin;
        requiredApprovals = _requiredApprovals;

        emit AdminSet(_initialAdmin);
    }

    function addReviewer(address reviewer) external onlyAdmin {
        if (reviewer == address(0)) revert ZeroAddress();
        if (isReviewer[reviewer]) revert InvalidStatus();

        isReviewer[reviewer] = true;
        reviewerCount += 1;

        emit ReviewerAdded(reviewer);
    }

    function removeReviewer(address reviewer) external onlyAdmin {
        if (reviewer == address(0)) revert ZeroAddress();
        if (!isReviewer[reviewer]) revert InvalidStatus();
        if (reviewerCount - 1 < requiredApprovals) revert InsufficientApprovers();

        isReviewer[reviewer] = false;
        reviewerCount -= 1;

        emit ReviewerRemoved(reviewer);
    }

    function setRequiredApprovals(uint256 n) external onlyAdmin {
        if (n == 0) revert ZeroAmount();
        if (reviewerCount > 0 && n > reviewerCount) revert InsufficientApprovers();

        uint256 old = requiredApprovals;
        requiredApprovals = n;

        emit RequiredApprovalsChanged(old, n);
    }

    function createGrant(
        string calldata title,
        string calldata description,
        uint256 milestoneCount,
        string[] calldata milestoneTitles,
        string[] calldata milestoneDescs,
        uint256[] calldata milestoneAmounts,
        uint40 deadline
    ) external onlyAdmin returns (uint256 grantId) {
        if (milestoneCount == 0) revert ZeroAmount();
        if (milestoneCount > MAX_MILESTONES) revert MaxMilestonesExceeded();
        if (deadline != 0 && deadline <= block.timestamp) revert DeadlineExpired();
        if (
            milestoneTitles.length != milestoneCount
                || milestoneDescs.length != milestoneCount
                || milestoneAmounts.length != milestoneCount
        ) revert ArrayLengthMismatch();

        uint128 totalAmount;
        for (uint256 i = 0; i < milestoneCount; i++) {
            uint128 amount = uint128(milestoneAmounts[i]);
            if (amount == 0) revert ZeroAmount();

            totalAmount += amount;

            milestones[grantCount + 1][i] = Milestone({
                index: uint8(i),
                title: milestoneTitles[i],
                description: milestoneDescs[i],
                amount: amount,
                status: MilestoneStatus.Pending,
                submittedBy: address(0),
                evidenceHash: bytes32(0),
                submittedAt: 0,
                approvedAt: 0
            });
        }

        if (totalAmount == 0) revert ZeroAmount();

        grantCount += 1;
        grantId = grantCount;

        grants[grantId] = Grant({
            title: title,
            description: description,
            funder: address(0),
            builder: address(0),
            totalAmount: totalAmount,
            releasedAmount: 0,
            milestoneCount: uint8(milestoneCount),
            approvedMilestoneCount: 0,
            status: GrantStatus.Open,
            createdAt: uint40(block.timestamp),
            deadline: deadline
        });

        emit GrantCreated(grantId, title, msg.sender);
        emit GrantDeadlineSet(grantId, deadline);
    }

    function fundGrant(uint256 grantId) external onlyAdmin whenNotPaused nonReentrant {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Open) revert InvalidStatus();
        if (grant.totalAmount == 0) revert ZeroAmount();
        if (reviewerCount < requiredApprovals) revert InsufficientApprovers();

        usdc.safeTransferFrom(msg.sender, address(this), grant.totalAmount);

        grant.funder = msg.sender;
        grant.status = GrantStatus.Active;
        totalFunded += grant.totalAmount;

        emit GrantFunded(grantId, grant.totalAmount, msg.sender);
    }

    function applyForGrant(uint256 grantId) external whenNotPaused {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Active) revert InvalidStatus();
        if (grant.builder != address(0)) revert InvalidStatus();
        if (isReviewer[msg.sender]) revert InvalidStatus();
        if (msg.sender == admin) revert AdminCannotBeBuilder();

        grant.builder = msg.sender;

        emit GrantApplied(grantId, msg.sender);
    }

    function submitMilestoneEvidence(uint256 grantId, uint256 milestoneIndex, string calldata evidenceUri)
        external
        whenNotPaused
    {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.builder != msg.sender) revert NotBuilder();
        if (grant.status != GrantStatus.Active) revert InvalidStatus();

        Milestone storage milestone = _requireValidMilestone(grantId, milestoneIndex);
        if (milestone.status != MilestoneStatus.Pending && milestone.status != MilestoneStatus.Rejected) {
            revert InvalidStatus();
        }

        milestoneRound[grantId][milestoneIndex] += 1;
        voteCounts[grantId][milestoneIndex] = VoteCount({approvals: 0, rejections: 0});

        bytes32 hash = keccak256(abi.encodePacked(evidenceUri));

        milestone.status = MilestoneStatus.SubmittedForReview;
        milestone.submittedBy = msg.sender;
        milestone.evidenceHash = hash;
        milestone.submittedAt = uint40(block.timestamp);

        emit MilestoneSubmitted(grantId, milestoneIndex, evidenceUri, msg.sender);
    }

    function reviewMilestone(uint256 grantId, uint256 milestoneIndex, bool approve)
        external
        onlyReviewer
        whenNotPaused
        nonReentrant
    {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Active) revert InvalidStatus();
        if (grant.builder == address(0)) revert InvalidStatus();
        if (reviewerCount < requiredApprovals) revert InsufficientApprovers();

        Milestone storage milestone = _requireValidMilestone(grantId, milestoneIndex);
        if (milestone.status != MilestoneStatus.SubmittedForReview) revert InvalidStatus();

        uint256 round = milestoneRound[grantId][milestoneIndex];
        if (milestoneVotes[grantId][milestoneIndex][round][msg.sender]) revert AlreadyVoted();

        milestoneVotes[grantId][milestoneIndex][round][msg.sender] = true;

        VoteCount storage vc = voteCounts[grantId][milestoneIndex];

        if (approve) {
            vc.approvals += 1;

            if (vc.approvals >= requiredApprovals) {
                milestone.status = MilestoneStatus.Approved;
                milestone.approvedAt = uint40(block.timestamp);

                uint128 amount = milestone.amount;
                grant.releasedAmount += amount;
                pendingWithdrawals[grant.builder] += uint128(amount);
                grant.approvedMilestoneCount += 1;

                emit MilestonePaymentQueued(grantId, milestoneIndex, amount, grant.builder);
                emit MilestoneApproved(grantId, milestoneIndex, amount, grant.builder);

                if (grant.approvedMilestoneCount >= grant.milestoneCount) {
                    grant.status = GrantStatus.Completed;
                    emit GrantCompleted(grantId, grant.builder);
                }
            }
        } else {
            vc.rejections += 1;

            if (vc.rejections > reviewerCount - requiredApprovals) {
                milestone.status = MilestoneStatus.Rejected;
            }
        }

        emit MilestoneReviewCast(grantId, milestoneIndex, msg.sender, approve);
    }

    function claimPayment() external nonReentrant {
        uint128 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert ZeroAmount();

        pendingWithdrawals[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, amount);

        emit PaymentClaimed(msg.sender, amount);
    }

    function cancelGrant(uint256 grantId) external onlyAdmin {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Open && grant.status != GrantStatus.Active) revert InvalidStatus();

        uint128 unreleased = grant.totalAmount - grant.releasedAmount;
        grant.status = GrantStatus.Cancelled;

        if (grant.funder != address(0) && unreleased > 0) {
            pendingFunderRefunds[grant.funder] += uint128(unreleased);
            emit FunderRefundQueued(grantId, unreleased, grant.funder);
        }

        emit GrantCancelled(grantId, msg.sender);
    }

    function claimFunderRefund() external nonReentrant {
        uint128 amount = pendingFunderRefunds[msg.sender];
        if (amount == 0) revert NoRefundDue();

        pendingFunderRefunds[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, amount);

        emit FunderRefundClaimed(msg.sender, amount);
    }

    function adminReassignBuilder(uint256 grantId, address newBuilder) external onlyAdmin {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Active) revert InvalidStatus();
        if (newBuilder == address(0)) revert ZeroAddress();
        if (isReviewer[newBuilder]) revert InvalidStatus();
        if (newBuilder == admin) revert AdminCannotBeBuilder();

        address oldBuilder = grant.builder;

        for (uint8 i = 0; i < grant.milestoneCount; i++) {
            Milestone storage milestone = milestones[grantId][i];
            if (milestone.status == MilestoneStatus.SubmittedForReview) {
                milestone.status = MilestoneStatus.Pending;
                voteCounts[grantId][i] = VoteCount({approvals: 0, rejections: 0});
                milestoneRound[grantId][i] += 1;
            }
        }

        grant.builder = newBuilder;

        emit BuilderReassigned(grantId, oldBuilder, newBuilder);
    }

    function expireGrant(uint256 grantId) external {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Active) revert InvalidStatus();
        if (grant.deadline == 0 || block.timestamp <= uint256(grant.deadline)) revert NotExpired();

        uint128 unreleased = grant.totalAmount - grant.releasedAmount;
        grant.status = GrantStatus.Cancelled;

        if (grant.funder != address(0) && unreleased > 0) {
            pendingFunderRefunds[grant.funder] += uint128(unreleased);
            emit FunderRefundQueued(grantId, unreleased, grant.funder);
        }

        emit GrantExpired(grantId);
    }

    function pause() external onlyAdmin {
        paused = true;
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyAdmin {
        paused = false;
        emit ContractUnpaused(msg.sender);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert ZeroAddress();

        address oldAdmin = admin;
        admin = newAdmin;

        emit AdminTransferred(oldAdmin, newAdmin);
    }

    function getGrant(uint256 grantId) external view returns (Grant memory) {
        return _requireValidGrant(grantId);
    }

    function getMilestone(uint256 grantId, uint256 milestoneIndex) external view returns (Milestone memory) {
        return _requireValidMilestone(grantId, milestoneIndex);
    }

    function getReviewerVote(uint256 grantId, uint256 milestoneIndex, address reviewer) external view returns (bool) {
        uint256 round = milestoneRound[grantId][milestoneIndex];
        return milestoneVotes[grantId][milestoneIndex][round][reviewer];
    }

    function getMilestoneRound(uint256 grantId, uint256 milestoneIndex) external view returns (uint256) {
        return milestoneRound[grantId][milestoneIndex];
    }

    function getMilestoneApprovalCount(uint256 grantId, uint256 milestoneIndex) external view returns (uint256) {
        return voteCounts[grantId][milestoneIndex].approvals;
    }

    function getMilestoneVoteCounts(uint256 grantId, uint256 milestoneIndex)
        external
        view
        returns (uint128 approvals, uint128 rejections)
    {
        VoteCount storage vc = voteCounts[grantId][milestoneIndex];
        return (vc.approvals, vc.rejections);
    }

    function getGrantsBatch(uint256 fromId, uint256 toId) external view returns (Grant[] memory) {
        if (fromId == 0 || toId < fromId || toId > grantCount) revert InvalidGrant();
        if (toId - fromId > 50) revert BatchTooLarge();

        uint256 length = toId - fromId + 1;
        Grant[] memory batch = new Grant[](length);

        for (uint256 i = 0; i < length; i++) {
            batch[i] = grants[fromId + i];
        }

        return batch;
    }

    function _requireValidGrant(uint256 grantId) internal view returns (Grant storage grant) {
        if (grantId == 0 || grantId > grantCount) revert InvalidGrant();
        grant = grants[grantId];
    }

    function _requireValidMilestone(uint256 grantId, uint256 milestoneIndex)
        internal
        view
        returns (Milestone storage milestone)
    {
        Grant storage grant = _requireValidGrant(grantId);
        if (milestoneIndex >= grant.milestoneCount) revert InvalidMilestone();
        milestone = milestones[grantId][milestoneIndex];
    }
}
