// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {FundoraEvents} from "../FundoraEvents.sol";
import {AdminRegistry} from "../AdminRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// ---------------------------------------------------------------------------
// Minimal ERC-20 Mock for testing
// ---------------------------------------------------------------------------
contract MockUSDC is IERC20 {
    string public name = "USD Coin";
    string public symbol = "USDC";
    uint8 public decimals = 6;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

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
        require(balanceOf[msg.sender] >= amount, "ERC20: insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "ERC20: insufficient balance");
        require(allowance[from][msg.sender] >= amount, "ERC20: insufficient allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

// ---------------------------------------------------------------------------
// Test Suite: FundoraEventsTest
// ---------------------------------------------------------------------------
contract FundoraEventsTest is Test {
    FundoraEvents internal eventsContract;
    AdminRegistry internal adminRegistry;
    MockUSDC internal usdc;

    address internal platformAdmin = makeAddr("platformAdmin");
    address internal organizer = makeAddr("organizer");
    address internal reviewer1 = makeAddr("reviewer1");
    address internal reviewer2 = makeAddr("reviewer2");
    address internal builder1 = makeAddr("builder1");
    address internal builder2 = makeAddr("builder2");
    address internal builder3 = makeAddr("builder3");
    address internal treasury = makeAddr("treasury");
    address internal stranger = makeAddr("stranger");

    uint128 internal constant DEFAULT_PRIZE_POOL = 10_000e6; // $10,000 USDC
    uint40 internal submissionDeadline;
    uint40 internal judgingDeadline;

    function setUp() public {
        usdc = new MockUSDC();
        adminRegistry = new AdminRegistry(address(usdc), treasury, 100e6);
        eventsContract = new FundoraEvents(address(usdc), platformAdmin, address(adminRegistry));

        submissionDeadline = uint40(block.timestamp + 7 days);
        judgingDeadline = uint40(block.timestamp + 14 days);

        // Fund organizer with USDC and approve contract
        usdc.mint(organizer, 100_000e6);
        vm.prank(organizer);
        usdc.approve(address(eventsContract), type(uint256).max);
    }

    // -----------------------------------------------------------------------
    // Helper Methods
    // -----------------------------------------------------------------------

    function _createNativeEvent() internal returns (uint256 eventId) {
        vm.prank(organizer);
        eventId = eventsContract.createEvent(
            "Arc DeFi Hackathon",
            "Build next-gen financial primitives on Arc",
            "",
            FundoraEvents.EventType.NativeEscrow,
            DEFAULT_PRIZE_POOL,
            submissionDeadline,
            judgingDeadline
        );
    }

    function _createExternalListing() internal returns (uint256 eventId) {
        vm.prank(organizer);
        eventId = eventsContract.createEvent(
            "Global Web3 Hackathon",
            "External event listed on Fundora",
            "https://ethglobal.com/events/arc2026",
            FundoraEvents.EventType.ExternalListing,
            0,
            0,
            0
        );
    }

    // -----------------------------------------------------------------------
    // Unit Tests: Creation & Setup
    // -----------------------------------------------------------------------

    function testCreateNativeEventAndFund() public {
        uint256 initialBal = usdc.balanceOf(organizer);

        uint256 eventId = _createNativeEvent();
        assertEq(eventId, 1);
        assertEq(eventsContract.eventCount(), 1);

        FundoraEvents.EventInfo memory ev = eventsContract.getEvent(eventId);
        assertEq(ev.title, "Arc DeFi Hackathon");
        assertEq(ev.organizer, organizer);
        assertEq(uint8(ev.eventType), uint8(FundoraEvents.EventType.NativeEscrow));
        assertEq(uint8(ev.status), uint8(FundoraEvents.EventStatus.Open));
        assertEq(ev.totalPrizePool, DEFAULT_PRIZE_POOL);
        assertEq(ev.submissionDeadline, submissionDeadline);
        assertEq(ev.judgingDeadline, judgingDeadline);

        // Verify USDC transfer to escrow
        assertEq(usdc.balanceOf(address(eventsContract)), DEFAULT_PRIZE_POOL);
        assertEq(usdc.balanceOf(organizer), initialBal - DEFAULT_PRIZE_POOL);
    }

    function testCreateExternalListing() public {
        uint256 eventId = _createExternalListing();
        assertEq(eventId, 1);

        FundoraEvents.EventInfo memory ev = eventsContract.getEvent(eventId);
        assertEq(ev.title, "Global Web3 Hackathon");
        assertEq(ev.externalUrl, "https://ethglobal.com/events/arc2026");
        assertEq(uint8(ev.eventType), uint8(FundoraEvents.EventType.ExternalListing));
        assertEq(ev.totalPrizePool, 0);
        assertEq(usdc.balanceOf(address(eventsContract)), 0);
    }

    function testCreateEventEmptyTitleReverts() public {
        vm.prank(organizer);
        vm.expectRevert(FundoraEvents.ZeroAmount.selector);
        eventsContract.createEvent(
            "",
            "Description",
            "",
            FundoraEvents.EventType.NativeEscrow,
            DEFAULT_PRIZE_POOL,
            submissionDeadline,
            judgingDeadline
        );
    }

    function testCreateNativeEventZeroPrizeReverts() public {
        vm.prank(organizer);
        vm.expectRevert(FundoraEvents.ZeroAmount.selector);
        eventsContract.createEvent(
            "Event",
            "Desc",
            "",
            FundoraEvents.EventType.NativeEscrow,
            0,
            submissionDeadline,
            judgingDeadline
        );
    }

    function testCreateNativeEventPastDeadlineReverts() public {
        vm.prank(organizer);
        vm.expectRevert(FundoraEvents.DeadlineExpired.selector);
        eventsContract.createEvent(
            "Event",
            "Desc",
            "",
            FundoraEvents.EventType.NativeEscrow,
            DEFAULT_PRIZE_POOL,
            uint40(block.timestamp - 1),
            judgingDeadline
        );
    }

    function testCreateExternalListingWithPrizeReverts() public {
        vm.prank(organizer);
        vm.expectRevert(FundoraEvents.ExternalEventNoEscrow.selector);
        eventsContract.createEvent(
            "Event",
            "Desc",
            "https://external.com",
            FundoraEvents.EventType.ExternalListing,
            1000e6,
            0,
            0
        );
    }

    // -----------------------------------------------------------------------
    // Unit Tests: Submissions
    // -----------------------------------------------------------------------

    function testSubmitEntrySuccess() public {
        uint256 eventId = _createNativeEvent();

        bytes32 hash = keccak256("github.com/arc/project");
        vm.prank(builder1);
        uint256 subId = eventsContract.submitEntry(eventId, "https://github.com/arc/project", hash);

        assertEq(subId, 1);
        assertEq(eventsContract.userSubmissionId(eventId, builder1), 1);

        FundoraEvents.Submission memory sub = eventsContract.getSubmission(eventId, subId);
        assertEq(sub.submitter, builder1);
        assertEq(sub.metadataUri, "https://github.com/arc/project");
        assertEq(sub.submissionHash, hash);
        assertEq(sub.scoreSum, 0);
        assertEq(sub.reviewCount, 0);
        assertFalse(sub.disqualified);
    }

    function testSubmitEntryDuplicateReverts() public {
        uint256 eventId = _createNativeEvent();

        bytes32 hash = keccak256("repo1");
        vm.prank(builder1);
        eventsContract.submitEntry(eventId, "uri1", hash);

        vm.prank(builder1);
        vm.expectRevert(FundoraEvents.AlreadySubmitted.selector);
        eventsContract.submitEntry(eventId, "uri2", hash);
    }

    function testSubmitEntryAfterDeadlineReverts() public {
        uint256 eventId = _createNativeEvent();

        vm.warp(submissionDeadline + 1);

        vm.prank(builder1);
        vm.expectRevert(FundoraEvents.DeadlineExpired.selector);
        eventsContract.submitEntry(eventId, "uri", keccak256("repo"));
    }

    function testDisqualifyEntry() public {
        uint256 eventId = _createNativeEvent();

        vm.prank(builder1);
        uint256 subId = eventsContract.submitEntry(eventId, "uri", keccak256("repo"));

        vm.prank(organizer);
        eventsContract.disqualifyEntry(eventId, subId, "Plagiarism detected");

        FundoraEvents.Submission memory sub = eventsContract.getSubmission(eventId, subId);
        assertTrue(sub.disqualified);
    }

    // -----------------------------------------------------------------------
    // Unit Tests: Reviewers & Scoring
    // -----------------------------------------------------------------------

    function testAddAndRemoveReviewers() public {
        uint256 eventId = _createNativeEvent();

        vm.prank(organizer);
        eventsContract.addReviewer(eventId, reviewer1);
        assertTrue(eventsContract.isEventReviewer(eventId, reviewer1));
        assertEq(eventsContract.getEvent(eventId).reviewerCount, 1);

        // Add second reviewer
        vm.prank(organizer);
        eventsContract.addReviewer(eventId, reviewer2);
        assertEq(eventsContract.getEvent(eventId).reviewerCount, 2);

        // Remove reviewer
        vm.prank(organizer);
        eventsContract.removeReviewer(eventId, reviewer1);
        assertFalse(eventsContract.isEventReviewer(eventId, reviewer1));
        assertEq(eventsContract.getEvent(eventId).reviewerCount, 1);
    }

    function testNonOrganizerCannotAddReviewer() public {
        uint256 eventId = _createNativeEvent();

        vm.prank(stranger);
        vm.expectRevert(FundoraEvents.NotOrganizer.selector);
        eventsContract.addReviewer(eventId, reviewer1);
    }

    function testSubmitReviewAndScoreTally() public {
        uint256 eventId = _createNativeEvent();

        vm.startPrank(organizer);
        eventsContract.addReviewer(eventId, reviewer1);
        eventsContract.addReviewer(eventId, reviewer2);
        vm.stopPrank();

        vm.prank(builder1);
        uint256 subId = eventsContract.submitEntry(eventId, "uri", keccak256("repo"));

        // Reviewer 1 scores 85/100
        bytes32 note1 = keccak256("Great architecture");
        vm.prank(reviewer1);
        eventsContract.submitReview(eventId, subId, 85, note1);

        // Reviewer 2 scores 95/100
        bytes32 note2 = keccak256("Excellent UX");
        vm.prank(reviewer2);
        eventsContract.submitReview(eventId, subId, 95, note2);

        FundoraEvents.Submission memory sub = eventsContract.getSubmission(eventId, subId);
        assertEq(sub.reviewCount, 2);
        assertEq(sub.scoreSum, 180); // 85 + 95

        FundoraEvents.ReviewRecord memory rec1 = eventsContract.getReview(eventId, subId, reviewer1);
        assertEq(rec1.score, 85);
        assertEq(rec1.notesHash, note1);
    }

    function testReviewerDuplicateReviewReverts() public {
        uint256 eventId = _createNativeEvent();

        vm.prank(organizer);
        eventsContract.addReviewer(eventId, reviewer1);

        vm.prank(builder1);
        uint256 subId = eventsContract.submitEntry(eventId, "uri", keccak256("repo"));

        vm.prank(reviewer1);
        eventsContract.submitReview(eventId, subId, 90, keccak256("note"));

        vm.prank(reviewer1);
        vm.expectRevert(FundoraEvents.AlreadyReviewed.selector);
        eventsContract.submitReview(eventId, subId, 80, keccak256("note2"));
    }

    function testReviewScoreOutOfBoundsReverts() public {
        uint256 eventId = _createNativeEvent();

        vm.prank(organizer);
        eventsContract.addReviewer(eventId, reviewer1);

        vm.prank(builder1);
        uint256 subId = eventsContract.submitEntry(eventId, "uri", keccak256("repo"));

        vm.prank(reviewer1);
        vm.expectRevert(FundoraEvents.InvalidScore.selector);
        eventsContract.submitReview(eventId, subId, 0, keccak256("zero score"));

        vm.prank(reviewer1);
        vm.expectRevert(FundoraEvents.InvalidScore.selector);
        eventsContract.submitReview(eventId, subId, 101, keccak256("over 100"));
    }

    // -----------------------------------------------------------------------
    // Unit Tests: Winner Finalization & Pull Claims
    // -----------------------------------------------------------------------

    function testFinalizeWinnersMultiRecipientAndClaim() public {
        uint256 eventId = _createNativeEvent();

        // 3 builders submit
        vm.prank(builder1);
        eventsContract.submitEntry(eventId, "uri1", keccak256("repo1"));
        vm.prank(builder2);
        eventsContract.submitEntry(eventId, "uri2", keccak256("repo2"));
        vm.prank(builder3);
        eventsContract.submitEntry(eventId, "uri3", keccak256("repo3"));

        // Organizer finalizes winners: 1st ($5,000), 2nd ($3,000), 3rd ($1,000)
        address[] memory winners = new address[](3);
        winners[0] = builder1;
        winners[1] = builder2;
        winners[2] = builder3;

        uint128[] memory amounts = new uint128[](3);
        amounts[0] = 5_000e6;
        amounts[1] = 3_000e6;
        amounts[2] = 1_000e6;

        vm.prank(organizer);
        eventsContract.finalizeWinners(eventId, winners, amounts);

        // Check allocated and unallocated
        FundoraEvents.EventInfo memory ev = eventsContract.getEvent(eventId);
        assertEq(uint8(ev.status), uint8(FundoraEvents.EventStatus.Finalized));
        assertEq(ev.allocatedPrizePool, 9_000e6);
        // Remainder ($1,000) credited to organizer refund
        assertEq(eventsContract.pendingOrganizerRefunds(organizer), 1_000e6);

        // Verify pending withdrawals
        assertEq(eventsContract.pendingPrizeWithdrawals(builder1), 5_000e6);
        assertEq(eventsContract.pendingPrizeWithdrawals(builder2), 3_000e6);
        assertEq(eventsContract.pendingPrizeWithdrawals(builder3), 1_000e6);

        // Builders pull-claim independently
        vm.prank(builder1);
        eventsContract.claimPrize();
        assertEq(usdc.balanceOf(builder1), 5_000e6);
        assertEq(eventsContract.pendingPrizeWithdrawals(builder1), 0);

        vm.prank(builder2);
        eventsContract.claimPrize();
        assertEq(usdc.balanceOf(builder2), 3_000e6);
        assertEq(eventsContract.pendingPrizeWithdrawals(builder2), 0);

        vm.prank(builder3);
        eventsContract.claimPrize();
        assertEq(usdc.balanceOf(builder3), 1_000e6);
        assertEq(eventsContract.pendingPrizeWithdrawals(builder3), 0);

        // Organizer claims unallocated refund
        uint256 orgBalBefore = usdc.balanceOf(organizer);
        vm.prank(organizer);
        eventsContract.claimOrganizerRefund();
        assertEq(usdc.balanceOf(organizer), orgBalBefore + 1_000e6);
        assertEq(eventsContract.pendingOrganizerRefunds(organizer), 0);
    }

    function testFinalizeWinnersExceedingPoolReverts() public {
        uint256 eventId = _createNativeEvent(); // $10,000 pool

        address[] memory winners = new address[](2);
        winners[0] = builder1;
        winners[1] = builder2;

        uint128[] memory amounts = new uint128[](2);
        amounts[0] = 6_000e6;
        amounts[1] = 5_000e6; // Total $11,000 > $10,000

        vm.prank(organizer);
        vm.expectRevert(FundoraEvents.InsufficientPrizePool.selector);
        eventsContract.finalizeWinners(eventId, winners, amounts);
    }

    function testClaimPrizeZeroBalanceReverts() public {
        vm.prank(stranger);
        vm.expectRevert(FundoraEvents.ZeroAmount.selector);
        eventsContract.claimPrize();
    }

    // -----------------------------------------------------------------------
    // Unit Tests: Cancellation & Refunds
    // -----------------------------------------------------------------------

    function testCancelEventRefundsOrganizer() public {
        uint256 eventId = _createNativeEvent();

        vm.prank(organizer);
        eventsContract.cancelEvent(eventId);

        FundoraEvents.EventInfo memory ev = eventsContract.getEvent(eventId);
        assertEq(uint8(ev.status), uint8(FundoraEvents.EventStatus.Cancelled));
        assertEq(eventsContract.pendingOrganizerRefunds(organizer), DEFAULT_PRIZE_POOL);

        uint256 orgBalBefore = usdc.balanceOf(organizer);
        vm.prank(organizer);
        eventsContract.claimOrganizerRefund();
        assertEq(usdc.balanceOf(organizer), orgBalBefore + DEFAULT_PRIZE_POOL);
    }

    // -----------------------------------------------------------------------
    // Unit Tests: Batch View Functions & Pagination
    // -----------------------------------------------------------------------

    function testBatchGetEvents() public {
        for (uint256 i = 0; i < 5; i++) {
            _createNativeEvent();
        }

        FundoraEvents.EventInfo[] memory batch = eventsContract.getEventsBatch(0, 3);
        assertEq(batch.length, 3);
        assertEq(batch[0].id, 1);
        assertEq(batch[1].id, 2);
        assertEq(batch[2].id, 3);

        FundoraEvents.EventInfo[] memory batch2 = eventsContract.getEventsBatch(3, 3);
        assertEq(batch2.length, 2);
        assertEq(batch2[0].id, 4);
        assertEq(batch2[1].id, 5);
    }

    function testBatchGetSubmissions() public {
        uint256 eventId = _createNativeEvent();

        for (uint160 i = 1; i <= 5; i++) {
            address b = address(i + 100);
            vm.prank(b);
            eventsContract.submitEntry(eventId, "uri", keccak256(abi.encodePacked(i)));
        }

        FundoraEvents.Submission[] memory subBatch = eventsContract.getSubmissionsBatch(eventId, 0, 4);
        assertEq(subBatch.length, 4);
        assertEq(subBatch[0].id, 1);
        assertEq(subBatch[3].id, 4);
    }

    // -----------------------------------------------------------------------
    // Unit Tests: Admin Registry & Pausability
    // -----------------------------------------------------------------------

    function testAdminRegistryAuthorization() public {
        address registeredUser = makeAddr("registeredUser");
        usdc.mint(registeredUser, 500e6);

        // Register in AdminRegistry
        vm.startPrank(registeredUser);
        usdc.approve(address(adminRegistry), 100e6);
        adminRegistry.registerAdmin("archouse_user", "MyDAO", "Grants for Arc", 50_000e6, 3, "Prizes");
        vm.stopPrank();

        assertTrue(eventsContract.isAuthorizedAdmin(registeredUser));

        // Registered user can manage stranger's event as admin
        uint256 eventId = _createNativeEvent();
        vm.prank(registeredUser);
        eventsContract.addReviewer(eventId, reviewer1);
        assertTrue(eventsContract.isEventReviewer(eventId, reviewer1));
    }

    function testPauseBlocksStateChanges() public {
        vm.prank(platformAdmin);
        eventsContract.pause();

        vm.prank(organizer);
        vm.expectRevert(FundoraEvents.Paused.selector);
        eventsContract.createEvent(
            "Paused Hackathon",
            "Desc",
            "",
            FundoraEvents.EventType.NativeEscrow,
            DEFAULT_PRIZE_POOL,
            submissionDeadline,
            judgingDeadline
        );
    }

    // -----------------------------------------------------------------------
    // Fuzz Testing: Dynamic Prize Splits
    // -----------------------------------------------------------------------

    function testFuzzPrizeDistribution(uint32 prize1, uint32 prize2, uint32 prize3) public {
        vm.assume(prize1 > 0 && prize2 > 0 && prize3 > 0);
        uint128 p1 = uint128(prize1) * 1e6;
        uint128 p2 = uint128(prize2) * 1e6;
        uint128 p3 = uint128(prize3) * 1e6;

        uint128 totalRequired = p1 + p2 + p3;
        vm.assume(totalRequired <= 1_000_000_000e6); // Up to $1B

        usdc.mint(organizer, totalRequired);
        vm.prank(organizer);
        uint256 eventId = eventsContract.createEvent(
            "Fuzz Event",
            "Desc",
            "",
            FundoraEvents.EventType.NativeEscrow,
            totalRequired,
            submissionDeadline,
            judgingDeadline
        );

        address[] memory winners = new address[](3);
        winners[0] = builder1;
        winners[1] = builder2;
        winners[2] = builder3;

        uint128[] memory amounts = new uint128[](3);
        amounts[0] = p1;
        amounts[1] = p2;
        amounts[2] = p3;

        vm.prank(organizer);
        eventsContract.finalizeWinners(eventId, winners, amounts);

        assertEq(eventsContract.pendingPrizeWithdrawals(builder1), p1);
        assertEq(eventsContract.pendingPrizeWithdrawals(builder2), p2);
        assertEq(eventsContract.pendingPrizeWithdrawals(builder3), p3);
    }
}
