// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IAdminRegistry} from "./AdminRegistry.sol";

/// @title FundoraEvents - Hackathons & Contests Platform for Arc Network
/// @notice Manages native onchain USDC prize escrow, entry submissions, per-event reviewer scoring, and pull-claim reward distributions.
contract FundoraEvents is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum EventType {
        NativeEscrow,
        ExternalListing
    }

    enum EventStatus {
        Open,
        SubmissionsClosed,
        Finalized,
        Cancelled
    }

    struct EventInfo {
        uint256 id;
        string title;
        string description;
        string externalUrl;
        EventType eventType;
        EventStatus status;
        address organizer;
        uint128 totalPrizePool;
        uint128 allocatedPrizePool;
        uint40 submissionDeadline;
        uint40 judgingDeadline;
        uint32 submissionCount;
        uint32 reviewerCount;
        uint40 createdAt;
    }

    struct Submission {
        uint256 id;
        uint256 eventId;
        address submitter;
        string metadataUri;
        bytes32 submissionHash;
        uint40 submittedAt;
        uint32 scoreSum;
        uint16 reviewCount;
        bool disqualified;
    }

    struct ReviewRecord {
        uint16 score;
        bytes32 notesHash;
        uint40 reviewedAt;
    }

    uint8 public constant MAX_WINNERS = 50;
    uint8 public constant MAX_BATCH_SIZE = 50;

    IERC20 public immutable usdc;
    address public admin;
    IAdminRegistry public adminRegistry;
    bool public paused;
    uint256 public eventCount;
    uint128 public totalEscrowFunded;

    mapping(uint256 => EventInfo) public events;
    mapping(uint256 => mapping(uint256 => Submission)) public submissions;
    mapping(uint256 => mapping(address => uint256)) public userSubmissionId;
    mapping(uint256 => mapping(address => bool)) public isEventReviewer;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasReviewed;
    mapping(uint256 => mapping(uint256 => mapping(address => ReviewRecord))) public reviewRecords;

    mapping(address => uint128) public pendingPrizeWithdrawals;
    mapping(address => uint128) public pendingOrganizerRefunds;

    error ZeroAddress();
    error ZeroAmount();
    error NotAdmin();
    error NotOrganizer();
    error NotReviewer();
    error InvalidEvent();
    error InvalidSubmission();
    error InvalidStatus();
    error DeadlineExpired();
    error DeadlineNotReached();
    error SubmissionsClosedError();
    error AlreadySubmitted();
    error AlreadyReviewed();
    error InvalidScore();
    error ArrayLengthMismatch();
    error MaxWinnersExceeded();
    error InsufficientPrizePool();
    error Paused();
    error BatchTooLarge();
    error Disqualified();
    error ExternalEventNoEscrow();

    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);
    event AdminRegistrySet(address indexed adminRegistry);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);

    event EventCreated(
        uint256 indexed eventId,
        string title,
        address indexed organizer,
        EventType eventType,
        uint128 totalPrizePool,
        uint40 submissionDeadline,
        uint40 judgingDeadline
    );
    event EventExternalUrlSet(uint256 indexed eventId, string externalUrl);
    event EventFunded(uint256 indexed eventId, uint128 amount, address indexed funder);
    event EventSubmissionsClosed(uint256 indexed eventId);
    event EventCancelled(uint256 indexed eventId, uint128 refundAmount, address indexed organizer);

    event EntrySubmitted(
        uint256 indexed eventId,
        uint256 indexed submissionId,
        address indexed submitter,
        string metadataUri,
        bytes32 submissionHash
    );
    event EntryDisqualified(
        uint256 indexed eventId,
        uint256 indexed submissionId,
        address indexed by,
        string reason
    );

    event ReviewerAdded(uint256 indexed eventId, address indexed reviewer);
    event ReviewerRemoved(uint256 indexed eventId, address indexed reviewer);
    event ReviewSubmitted(
        uint256 indexed eventId,
        uint256 indexed submissionId,
        address indexed reviewer,
        uint16 score,
        bytes32 notesHash
    );

    event WinnersFinalized(
        uint256 indexed eventId,
        address[] winners,
        uint128[] amounts,
        uint128 totalAllocated
    );
    event PrizeClaimed(address indexed winner, uint128 amount);
    event OrganizerRefundClaimed(address indexed organizer, uint128 amount);

    modifier onlyPlatformAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyAuthorizedAdmin() {
        if (!isAuthorizedAdmin(msg.sender)) revert NotAdmin();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert Paused();
        _;
    }

    constructor(address _usdc, address _initialAdmin, address _adminRegistry) {
        if (_usdc == address(0) || _initialAdmin == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
        admin = _initialAdmin;
        adminRegistry = IAdminRegistry(_adminRegistry);
    }

    function isAuthorizedAdmin(address account) public view returns (bool) {
        if (account == admin) return true;
        if (address(adminRegistry) != address(0)) {
            try adminRegistry.isAdmin(account) returns (bool res) {
                return res;
            } catch {
                return false;
            }
        }
        return false;
    }

    function isEventOrganizerOrAdmin(uint256 eventId, address account) public view returns (bool) {
        return account == events[eventId].organizer || isAuthorizedAdmin(account);
    }

    /// @notice Create an onchain hackathon/contest or list an external event
    function createEvent(
        string calldata title,
        string calldata description,
        string calldata externalUrl,
        EventType eventType,
        uint128 totalPrizePool,
        uint40 submissionDeadline,
        uint40 judgingDeadline
    ) external whenNotPaused nonReentrant returns (uint256 eventId) {
        if (bytes(title).length == 0) revert ZeroAmount();

        if (eventType == EventType.NativeEscrow) {
            if (totalPrizePool == 0) revert ZeroAmount();
            if (submissionDeadline <= block.timestamp) revert DeadlineExpired();
            if (judgingDeadline < submissionDeadline) revert DeadlineExpired();

            usdc.safeTransferFrom(msg.sender, address(this), totalPrizePool);
            totalEscrowFunded += totalPrizePool;
        } else {
            // External listing has no contract escrow
            if (totalPrizePool != 0) revert ExternalEventNoEscrow();
            if (bytes(externalUrl).length == 0) revert ZeroAmount();
        }

        eventCount += 1;
        eventId = eventCount;

        events[eventId] = EventInfo({
            id: eventId,
            title: title,
            description: description,
            externalUrl: externalUrl,
            eventType: eventType,
            status: EventStatus.Open,
            organizer: msg.sender,
            totalPrizePool: totalPrizePool,
            allocatedPrizePool: 0,
            submissionDeadline: submissionDeadline,
            judgingDeadline: judgingDeadline,
            submissionCount: 0,
            reviewerCount: 0,
            createdAt: uint40(block.timestamp)
        });

        emit EventCreated(
            eventId,
            title,
            msg.sender,
            eventType,
            totalPrizePool,
            submissionDeadline,
            judgingDeadline
        );

        if (bytes(externalUrl).length > 0) {
            emit EventExternalUrlSet(eventId, externalUrl);
        }

        if (totalPrizePool > 0) {
            emit EventFunded(eventId, totalPrizePool, msg.sender);
        }
    }

    /// @notice Add an invited reviewer for an event
    function addReviewer(uint256 eventId, address reviewer) external whenNotPaused {
        if (reviewer == address(0)) revert ZeroAddress();
        EventInfo storage ev = _requireValidEvent(eventId);
        if (!isEventOrganizerOrAdmin(eventId, msg.sender)) revert NotOrganizer();
        if (ev.status == EventStatus.Finalized || ev.status == EventStatus.Cancelled) {
            revert InvalidStatus();
        }
        if (isEventReviewer[eventId][reviewer]) revert InvalidStatus();

        isEventReviewer[eventId][reviewer] = true;
        ev.reviewerCount += 1;

        emit ReviewerAdded(eventId, reviewer);
    }

    /// @notice Remove an invited reviewer for an event
    function removeReviewer(uint256 eventId, address reviewer) external whenNotPaused {
        if (reviewer == address(0)) revert ZeroAddress();
        EventInfo storage ev = _requireValidEvent(eventId);
        if (!isEventOrganizerOrAdmin(eventId, msg.sender)) revert NotOrganizer();
        if (!isEventReviewer[eventId][reviewer]) revert InvalidStatus();

        isEventReviewer[eventId][reviewer] = false;
        ev.reviewerCount -= 1;

        emit ReviewerRemoved(eventId, reviewer);
    }

    /// @notice Submit a project entry for an event
    function submitEntry(
        uint256 eventId,
        string calldata metadataUri,
        bytes32 submissionHash
    ) external whenNotPaused returns (uint256 submissionId) {
        EventInfo storage ev = _requireValidEvent(eventId);
        if (ev.status != EventStatus.Open) revert SubmissionsClosedError();
        if (ev.submissionDeadline != 0 && block.timestamp > ev.submissionDeadline) {
            revert DeadlineExpired();
        }
        if (userSubmissionId[eventId][msg.sender] != 0) revert AlreadySubmitted();
        if (bytes(metadataUri).length == 0) revert ZeroAmount();

        ev.submissionCount += 1;
        submissionId = ev.submissionCount;

        submissions[eventId][submissionId] = Submission({
            id: submissionId,
            eventId: eventId,
            submitter: msg.sender,
            metadataUri: metadataUri,
            submissionHash: submissionHash,
            submittedAt: uint40(block.timestamp),
            scoreSum: 0,
            reviewCount: 0,
            disqualified: false
        });

        userSubmissionId[eventId][msg.sender] = submissionId;

        emit EntrySubmitted(eventId, submissionId, msg.sender, metadataUri, submissionHash);
    }

    /// @notice Close submissions for an event
    function closeSubmissions(uint256 eventId) external whenNotPaused {
        EventInfo storage ev = _requireValidEvent(eventId);
        if (!isEventOrganizerOrAdmin(eventId, msg.sender) && block.timestamp < ev.submissionDeadline) {
            revert NotOrganizer();
        }
        if (ev.status != EventStatus.Open) revert InvalidStatus();

        ev.status = EventStatus.SubmissionsClosed;
        emit EventSubmissionsClosed(eventId);
    }

    /// @notice Disqualify a spam or infringing submission
    function disqualifyEntry(
        uint256 eventId,
        uint256 submissionId,
        string calldata reason
    ) external whenNotPaused {
        _requireValidEvent(eventId);
        if (!isEventOrganizerOrAdmin(eventId, msg.sender)) revert NotOrganizer();
        Submission storage sub = _requireValidSubmission(eventId, submissionId);
        if (sub.disqualified) revert InvalidStatus();

        sub.disqualified = true;
        emit EntryDisqualified(eventId, submissionId, msg.sender, reason);
    }

    /// @notice Reviewer scores a submission (score between 1 and 100)
    function submitReview(
        uint256 eventId,
        uint256 submissionId,
        uint16 score,
        bytes32 notesHash
    ) external whenNotPaused {
        EventInfo storage ev = _requireValidEvent(eventId);
        if (!isEventReviewer[eventId][msg.sender]) revert NotReviewer();
        if (ev.status == EventStatus.Finalized || ev.status == EventStatus.Cancelled) {
            revert InvalidStatus();
        }
        if (score == 0 || score > 100) revert InvalidScore();

        Submission storage sub = _requireValidSubmission(eventId, submissionId);
        if (sub.disqualified) revert Disqualified();
        if (hasReviewed[eventId][submissionId][msg.sender]) revert AlreadyReviewed();

        hasReviewed[eventId][submissionId][msg.sender] = true;
        reviewRecords[eventId][submissionId][msg.sender] = ReviewRecord({
            score: score,
            notesHash: notesHash,
            reviewedAt: uint40(block.timestamp)
        });

        sub.scoreSum += score;
        sub.reviewCount += 1;

        emit ReviewSubmitted(eventId, submissionId, msg.sender, score, notesHash);
    }

    /// @notice Finalize winners and allocate prizes across multiple recipients
    function finalizeWinners(
        uint256 eventId,
        address[] calldata winners,
        uint128[] calldata amounts
    ) external whenNotPaused nonReentrant {
        EventInfo storage ev = _requireValidEvent(eventId);
        if (!isEventOrganizerOrAdmin(eventId, msg.sender)) revert NotOrganizer();
        if (ev.eventType != EventType.NativeEscrow) revert ExternalEventNoEscrow();
        if (ev.status == EventStatus.Finalized || ev.status == EventStatus.Cancelled) {
            revert InvalidStatus();
        }
        if (winners.length == 0 || winners.length != amounts.length) revert ArrayLengthMismatch();
        if (winners.length > MAX_WINNERS) revert MaxWinnersExceeded();

        uint128 totalAllocated = 0;
        for (uint256 i = 0; i < winners.length; i++) {
            address winner = winners[i];
            uint128 amount = amounts[i];

            if (winner == address(0)) revert ZeroAddress();
            if (amount == 0) revert ZeroAmount();

            totalAllocated += amount;
            pendingPrizeWithdrawals[winner] += amount;
        }

        if (totalAllocated > ev.totalPrizePool) revert InsufficientPrizePool();

        ev.allocatedPrizePool = totalAllocated;
        ev.status = EventStatus.Finalized;

        // Refund unallocated prize pool to organizer
        uint128 unallocated = ev.totalPrizePool - totalAllocated;
        if (unallocated > 0) {
            pendingOrganizerRefunds[ev.organizer] += unallocated;
        }

        emit WinnersFinalized(eventId, winners, amounts, totalAllocated);
    }

    /// @notice Winner pull-claims awarded prize USDC
    function claimPrize() external nonReentrant whenNotPaused {
        uint128 amount = pendingPrizeWithdrawals[msg.sender];
        if (amount == 0) revert ZeroAmount();

        pendingPrizeWithdrawals[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, amount);

        emit PrizeClaimed(msg.sender, amount);
    }

    /// @notice Organizer pull-claims unallocated prize pool or cancellation refund
    function claimOrganizerRefund() external nonReentrant whenNotPaused {
        uint128 amount = pendingOrganizerRefunds[msg.sender];
        if (amount == 0) revert ZeroAmount();

        pendingOrganizerRefunds[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, amount);

        emit OrganizerRefundClaimed(msg.sender, amount);
    }

    /// @notice Cancel event and queue refund of unallocated prize funds to organizer
    function cancelEvent(uint256 eventId) external whenNotPaused nonReentrant {
        EventInfo storage ev = _requireValidEvent(eventId);
        if (!isEventOrganizerOrAdmin(eventId, msg.sender)) revert NotOrganizer();
        if (ev.status == EventStatus.Finalized || ev.status == EventStatus.Cancelled) {
            revert InvalidStatus();
        }

        ev.status = EventStatus.Cancelled;

        uint128 refundable = ev.totalPrizePool - ev.allocatedPrizePool;
        if (refundable > 0) {
            pendingOrganizerRefunds[ev.organizer] += refundable;
        }

        emit EventCancelled(eventId, refundable, ev.organizer);
    }

    // ── Batch View Functions ────────────────────────────────────────────────

    function getEventsBatch(uint256 offset, uint256 limit)
        external
        view
        returns (EventInfo[] memory list)
    {
        if (limit > MAX_BATCH_SIZE) revert BatchTooLarge();
        if (offset >= eventCount || limit == 0) {
            return new EventInfo[](0);
        }

        uint256 end = offset + limit;
        if (end > eventCount) {
            end = eventCount;
        }

        uint256 count = end - offset;
        list = new EventInfo[](count);

        for (uint256 i = 0; i < count; i++) {
            list[i] = events[offset + 1 + i];
        }
    }

    function getSubmissionsBatch(uint256 eventId, uint256 offset, uint256 limit)
        external
        view
        returns (Submission[] memory list)
    {
        if (limit > MAX_BATCH_SIZE) revert BatchTooLarge();
        EventInfo storage ev = events[eventId];
        uint256 total = ev.submissionCount;

        if (offset >= total || limit == 0) {
            return new Submission[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 count = end - offset;
        list = new Submission[](count);

        for (uint256 i = 0; i < count; i++) {
            list[i] = submissions[eventId][offset + 1 + i];
        }
    }

    function getEvent(uint256 eventId) external view returns (EventInfo memory) {
        return _requireValidEvent(eventId);
    }

    function getSubmission(uint256 eventId, uint256 submissionId)
        external
        view
        returns (Submission memory)
    {
        return _requireValidSubmission(eventId, submissionId);
    }

    function getReview(uint256 eventId, uint256 submissionId, address reviewer)
        external
        view
        returns (ReviewRecord memory)
    {
        return reviewRecords[eventId][submissionId][reviewer];
    }

    // ── Platform Admin Controls ─────────────────────────────────────────────

    function pause() external onlyPlatformAdmin {
        paused = true;
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyPlatformAdmin {
        paused = false;
        emit ContractUnpaused(msg.sender);
    }

    function transferAdmin(address newAdmin) external onlyPlatformAdmin {
        if (newAdmin == address(0)) revert ZeroAddress();
        address old = admin;
        admin = newAdmin;
        emit AdminTransferred(old, newAdmin);
    }

    function setAdminRegistry(address _adminRegistry) external onlyPlatformAdmin {
        adminRegistry = IAdminRegistry(_adminRegistry);
        emit AdminRegistrySet(_adminRegistry);
    }

    // ── Internal Helpers ────────────────────────────────────────────────────

    function _requireValidEvent(uint256 eventId) internal view returns (EventInfo storage ev) {
        if (eventId == 0 || eventId > eventCount) revert InvalidEvent();
        ev = events[eventId];
    }

    function _requireValidSubmission(uint256 eventId, uint256 submissionId)
        internal
        view
        returns (Submission storage sub)
    {
        EventInfo storage ev = _requireValidEvent(eventId);
        if (submissionId == 0 || submissionId > ev.submissionCount) revert InvalidSubmission();
        sub = submissions[eventId][submissionId];
    }
}
