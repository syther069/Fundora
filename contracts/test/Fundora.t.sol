// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Fundora} from "../Fundora.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// ---------------------------------------------------------------------------
// Minimal ERC-20 mock – defined here so it stays inside contracts/test/ and
// cannot be picked up by the deploy tool.
// ---------------------------------------------------------------------------
contract MockUSDC {
    string public name;
    string public symbol;
    uint8  public decimals;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _sym, uint8 _dec) {
        name     = _name;
        symbol   = _sym;
        decimals = _dec;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply    += amount;
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
        balanceOf[to]         += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "ERC20: insufficient");
        require(allowance[from][msg.sender] >= amount, "ERC20: allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from]             -= amount;
        balanceOf[to]               += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

// ---------------------------------------------------------------------------
// Test contract
// ---------------------------------------------------------------------------
contract FundoraTest is Test {
    Fundora internal fundora;
    MockUSDC    internal usdc;

    address internal admin    = makeAddr("admin");
    address internal builder  = makeAddr("builder");
    address internal builder2 = makeAddr("builder2");
    address internal reviewer1 = makeAddr("reviewer1");
    address internal reviewer2 = makeAddr("reviewer2");
    address internal funder    = makeAddr("funder");   // not used as msg.sender for fund (admin funds)
    address internal anyone    = makeAddr("anyone");

    uint128 internal constant M0_AMOUNT = 100e6;
    uint128 internal constant M1_AMOUNT =  50e6;
    uint128 internal constant TOTAL     = M0_AMOUNT + M1_AMOUNT;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /// Create a standard 2-milestone grant and return its id.
    function _createStandardGrant() internal returns (uint256 grantId) {
        string[]   memory titles   = new string[](2);
        string[]   memory descs    = new string[](2);
        uint256[]  memory amounts  = new uint256[](2);
        titles[0]  = "Milestone 0";   descs[0]  = "Do thing A";  amounts[0] = M0_AMOUNT;
        titles[1]  = "Milestone 1";   descs[1]  = "Do thing B";  amounts[1] = M1_AMOUNT;

        vm.prank(admin);
        grantId = fundora.createGrant("Grant Title", "Description", 2, titles, descs, amounts, 0);
    }

    /// Create a grant with a custom number of milestones (each 10e6).
    function _createGrantN(uint256 n, uint40 deadline) internal returns (uint256 grantId) {
        string[]  memory titles  = new string[](n);
        string[]  memory descs   = new string[](n);
        uint256[] memory amounts = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            titles[i]  = "M";
            descs[i]   = "D";
            amounts[i] = 10e6;
        }
        vm.prank(admin);
        grantId = fundora.createGrant("G", "D", n, titles, descs, amounts, deadline);
    }

    /// Approve USDC and call fundGrant as admin.
    function _fundGrant(uint256 grantId) internal {
        uint128 total = fundora.getGrant(grantId).totalAmount;
        usdc.mint(admin, total);
        vm.startPrank(admin);
        usdc.approve(address(fundora), total);
        fundora.fundGrant(grantId);
        vm.stopPrank();
    }

    /// Apply for a grant as `who`.
    function _applyForGrant(uint256 grantId, address who) internal {
        vm.prank(who);
        fundora.applyForGrant(grantId);
    }

    /// Submit milestone evidence as the current grant builder.
    function _submitEvidence(uint256 grantId, uint256 mIdx, address who, string memory uri) internal {
        vm.prank(who);
        fundora.submitMilestoneEvidence(grantId, mIdx, uri);
    }

    /// Review a milestone (approve or reject) as `reviewer`.
    function _review(uint256 grantId, uint256 mIdx, address reviewer, bool approve) internal {
        vm.prank(reviewer);
        fundora.reviewMilestone(grantId, mIdx, approve);
    }

    // -----------------------------------------------------------------------
    // setUp – runs before every test
    // -----------------------------------------------------------------------
    function setUp() public {
        usdc = new MockUSDC("Mock USDC", "mUSDC", 6);

        vm.prank(admin);
        // Deploy with requiredApprovals = 1 (will add reviewer after)
        // We need at least 1 reviewer when funding, so set RA=1 in basic tests.
        fundora = new Fundora(address(usdc), admin, 1);

        // Add reviewer1 as default reviewer (satisfies reviewerCount >= requiredApprovals=1)
        vm.prank(admin);
        fundora.addReviewer(reviewer1);
    }

    // =======================================================================
    // 1. testFullHappyPath
    // =======================================================================
    function testFullHappyPath() public {
        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);
        _applyForGrant(grantId, builder);

        // --- Milestone 0 ---
        _submitEvidence(grantId, 0, builder, "https://github.com/pr/1");

        // Before approval: pull model – balance unchanged
        uint256 balBefore = usdc.balanceOf(builder);
        assertEq(fundora.pendingWithdrawals(builder), 0, "no pending before approve");

        _review(grantId, 0, reviewer1, true);

        // Payment queued, not yet transferred
        assertEq(fundora.pendingWithdrawals(builder), M0_AMOUNT, "pending after approve M0");
        assertEq(usdc.balanceOf(builder), balBefore, "balance unchanged before claim");

        // Builder claims
        vm.prank(builder);
        fundora.claimPayment();
        assertEq(usdc.balanceOf(builder), balBefore + M0_AMOUNT, "balance after M0 claim");
        assertEq(fundora.pendingWithdrawals(builder), 0, "pending cleared");

        // --- Milestone 1 ---
        _submitEvidence(grantId, 1, builder, "https://github.com/pr/2");
        _review(grantId, 1, reviewer1, true);

        // Grant should now be Completed
        Fundora.Grant memory g = fundora.getGrant(grantId);
        assertEq(uint8(g.status), uint8(Fundora.GrantStatus.Completed), "grant Completed");
        assertEq(g.approvedMilestoneCount, 2, "all milestones approved");

        // Builder claims remaining
        vm.prank(builder);
        fundora.claimPayment();
        assertEq(usdc.balanceOf(builder), balBefore + TOTAL, "builder received full payment");
    }

    // =======================================================================
    // 2. testRejectMilestoneAndResubmit
    // =======================================================================
    function testRejectMilestoneAndResubmit() public {
        // 2 reviewers, requiredApprovals = 2
        // auto-reject fires when vc.rejections > reviewerCount - requiredApprovals
        //   = 2 - 2 = 0  → fires when rejections > 0, i.e. on first rejection
        vm.prank(admin);
        fundora.addReviewer(reviewer2);           // now reviewerCount = 2
        vm.prank(admin);
        fundora.setRequiredApprovals(2);          // requiredApprovals = 2

        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);
        _applyForGrant(grantId, builder);

        _submitEvidence(grantId, 0, builder, "evidence-v1");

        // First rejection → auto-reject (rejections=1 > 2-2=0)
        _review(grantId, 0, reviewer1, false);

        Fundora.Milestone memory m = fundora.getMilestone(grantId, 0);
        assertEq(uint8(m.status), uint8(Fundora.MilestoneStatus.Rejected), "milestone Rejected");

        // Builder resubmits
        _submitEvidence(grantId, 0, builder, "evidence-v2");

        m = fundora.getMilestone(grantId, 0);
        assertEq(uint8(m.status), uint8(Fundora.MilestoneStatus.SubmittedForReview), "re-submitted");

        // Both reviewers approve
        _review(grantId, 0, reviewer1, true);
        _review(grantId, 0, reviewer2, true);

        m = fundora.getMilestone(grantId, 0);
        assertEq(uint8(m.status), uint8(Fundora.MilestoneStatus.Approved), "milestone Approved");
    }

    // =======================================================================
    // 3. testCancelGrantRefundsFunder (pull pattern)
    // =======================================================================
    function testCancelGrantRefundsFunder() public {
        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);   // admin is funder (fundGrant sets grant.funder = msg.sender = admin)

        uint256 adminUsdcBefore = usdc.balanceOf(admin);

        // Cancel the grant
        vm.prank(admin);
        fundora.cancelGrant(grantId);

        Fundora.Grant memory g = fundora.getGrant(grantId);
        assertEq(uint8(g.status), uint8(Fundora.GrantStatus.Cancelled), "grant Cancelled");

        // No milestones approved → full refund queued for funder (= admin)
        assertEq(fundora.pendingFunderRefunds(admin), TOTAL, "full refund queued");

        // Funder claims refund
        vm.prank(admin);
        fundora.claimFunderRefund();

        assertEq(usdc.balanceOf(admin), adminUsdcBefore + TOTAL, "funder received refund");
        assertEq(fundora.pendingFunderRefunds(admin), 0, "refund cleared");
    }

    // =======================================================================
    // 4. testReviewerCannotApplyAsBuilder
    // =======================================================================
    function testReviewerCannotApplyAsBuilder() public {
        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);

        vm.prank(reviewer1);
        vm.expectRevert(Fundora.InvalidStatus.selector);
        fundora.applyForGrant(grantId);
    }

    // =======================================================================
    // 5. testAdminCannotApplyAsBuilder
    // =======================================================================
    function testAdminCannotApplyAsBuilder() public {
        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);

        vm.prank(admin);
        vm.expectRevert(Fundora.AdminCannotBeBuilder.selector);
        fundora.applyForGrant(grantId);
    }

    // =======================================================================
    // 6. testAlreadyVotedReverts
    // =======================================================================
    function testAlreadyVotedReverts() public {
        // Setup: 2 reviewers, RA=2 so neither a single approve nor reject auto-closes
        vm.prank(admin);
        fundora.addReviewer(reviewer2);
        vm.prank(admin);
        fundora.setRequiredApprovals(2);

        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);
        _applyForGrant(grantId, builder);
        _submitEvidence(grantId, 0, builder, "ev");

        // reviewer1 approves once (approvals=1, need 2 → milestone still SubmittedForReview)
        _review(grantId, 0, reviewer1, true);

        // reviewer1 tries to approve again in the same round → AlreadyVoted
        vm.prank(reviewer1);
        vm.expectRevert(Fundora.AlreadyVoted.selector);
        fundora.reviewMilestone(grantId, 0, true);
    }

    // =======================================================================
    // 7. testRoundResetOnResubmit
    // =======================================================================
    function testRoundResetOnResubmit() public {
        // 2 reviewers, requiredApprovals = 2 so one approval doesn't close the milestone
        vm.prank(admin);
        fundora.addReviewer(reviewer2);
        vm.prank(admin);
        fundora.setRequiredApprovals(2);

        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);
        _applyForGrant(grantId, builder);

        // Round 1: reviewer1 approves (1/2 needed, milestone still open)
        _submitEvidence(grantId, 0, builder, "round1");
        uint256 roundBefore = fundora.getMilestoneRound(grantId, 0);

        _review(grantId, 0, reviewer1, true);
        // Confirm vote is recorded
        assertTrue(fundora.getReviewerVote(grantId, 0, reviewer1), "vote recorded round 1");

        // Force rejection so builder can resubmit: reviewer2 rejects
        // rejections=1 > reviewerCount-requiredApprovals = 0 → auto-reject
        _review(grantId, 0, reviewer2, false);

        Fundora.Milestone memory m = fundora.getMilestone(grantId, 0);
        assertEq(uint8(m.status), uint8(Fundora.MilestoneStatus.Rejected), "rejected");

        // Builder resubmits → new round
        _submitEvidence(grantId, 0, builder, "round2");
        uint256 roundAfter = fundora.getMilestoneRound(grantId, 0);
        assertEq(roundAfter, roundBefore + 1, "round incremented once on resubmit");

        // reviewer1 can vote again in the new round without AlreadyVoted
        _review(grantId, 0, reviewer1, true);
        assertTrue(fundora.getReviewerVote(grantId, 0, reviewer1), "reviewer1 voted in round 2");
    }

    // =======================================================================
    // 8. testClaimPaymentPullModel
    // =======================================================================
    function testClaimPaymentPullModel() public {
        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);
        _applyForGrant(grantId, builder);
        _submitEvidence(grantId, 0, builder, "ev");

        uint256 balBefore = usdc.balanceOf(builder);

        // Approve milestone
        _review(grantId, 0, reviewer1, true);

        // Balance must NOT have increased yet (pull model)
        assertEq(usdc.balanceOf(builder), balBefore, "no immediate transfer");

        // pendingWithdrawals should be positive
        assertGt(fundora.pendingWithdrawals(builder), 0, "pending > 0");

        // Builder claims
        vm.prank(builder);
        fundora.claimPayment();

        assertEq(usdc.balanceOf(builder), balBefore + M0_AMOUNT, "balance increased after claim");
        assertEq(fundora.pendingWithdrawals(builder), 0, "pending zeroed");
    }

    // =======================================================================
    // 9. testRequiredApprovalsGuard
    // =======================================================================
    function testRequiredApprovalsGuard() public {
        // reviewerCount = 1 (reviewer1 added in setUp)
        // setRequiredApprovals(reviewerCount + 1) should revert
        vm.prank(admin);
        vm.expectRevert(Fundora.InsufficientApprovers.selector);
        fundora.setRequiredApprovals(2); // reviewerCount is 1, so 2 > 1 → revert

        // removeReviewer when it would drop reviewerCount below requiredApprovals
        // requiredApprovals = 1, reviewerCount = 1 → removing would leave 0 < 1
        vm.prank(admin);
        vm.expectRevert(Fundora.InsufficientApprovers.selector);
        fundora.removeReviewer(reviewer1);

        // Add reviewer2 so we can remove reviewer1 safely
        vm.prank(admin);
        fundora.addReviewer(reviewer2); // reviewerCount = 2, RA = 1 → OK to remove one
        vm.prank(admin);
        fundora.removeReviewer(reviewer1); // reviewerCount becomes 1 >= RA=1 → OK

        // Now try to set RA = 2 when reviewerCount = 1
        vm.prank(admin);
        vm.expectRevert(Fundora.InsufficientApprovers.selector);
        fundora.setRequiredApprovals(2);
    }

    // =======================================================================
    // 10. testPauseBlocks
    // =======================================================================
    function testPauseBlocks() public {
        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);
        _applyForGrant(grantId, builder);

        // Pause
        vm.prank(admin);
        fundora.pause();
        assertTrue(fundora.paused(), "contract is paused");

        // fundGrant should revert Paused
        // Create another open grant first
        uint256 grantId2 = _createStandardGrant();
        usdc.mint(admin, TOTAL);
        vm.startPrank(admin);
        usdc.approve(address(fundora), TOTAL);
        vm.expectRevert(Fundora.Paused.selector);
        fundora.fundGrant(grantId2);
        vm.stopPrank();

        // submitMilestoneEvidence should revert Paused
        vm.prank(builder);
        vm.expectRevert(Fundora.Paused.selector);
        fundora.submitMilestoneEvidence(grantId, 0, "ev");

        // Unpause
        vm.prank(admin);
        fundora.unpause();
        assertFalse(fundora.paused(), "contract unpaused");

        // submitMilestoneEvidence now succeeds
        vm.prank(builder);
        fundora.submitMilestoneEvidence(grantId, 0, "ev");
        Fundora.Milestone memory m = fundora.getMilestone(grantId, 0);
        assertEq(uint8(m.status), uint8(Fundora.MilestoneStatus.SubmittedForReview));
    }

    // =======================================================================
    // 11. testAdminReassignBuilder
    // =======================================================================
    function testAdminReassignBuilder() public {
        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);
        _applyForGrant(grantId, builder);

        // Builder submits milestone 0 → SubmittedForReview
        _submitEvidence(grantId, 0, builder, "ev");
        Fundora.Milestone memory m = fundora.getMilestone(grantId, 0);
        assertEq(uint8(m.status), uint8(Fundora.MilestoneStatus.SubmittedForReview));

        // Admin reassigns to builder2
        vm.prank(admin);
        fundora.adminReassignBuilder(grantId, builder2);

        Fundora.Grant memory g = fundora.getGrant(grantId);
        assertEq(g.builder, builder2, "builder reassigned");

        // Milestone 0 should be reset to Pending
        m = fundora.getMilestone(grantId, 0);
        assertEq(uint8(m.status), uint8(Fundora.MilestoneStatus.Pending), "milestone reset");

        // Old builder can no longer submit evidence
        vm.prank(builder);
        vm.expectRevert(Fundora.NotBuilder.selector);
        fundora.submitMilestoneEvidence(grantId, 0, "old-ev");

        // New builder can submit evidence
        vm.prank(builder2);
        fundora.submitMilestoneEvidence(grantId, 0, "new-ev");
        m = fundora.getMilestone(grantId, 0);
        assertEq(uint8(m.status), uint8(Fundora.MilestoneStatus.SubmittedForReview));
    }

    // =======================================================================
    // 12. testExpireGrant
    // =======================================================================
    function testExpireGrant() public {
        uint40 deadline = uint40(block.timestamp + 1);

        // Create grant with deadline 1 second in future
        string[]  memory titles  = new string[](1);
        string[]  memory descs   = new string[](1);
        uint256[] memory amounts = new uint256[](1);
        titles[0] = "M"; descs[0] = "D"; amounts[0] = 10e6;
        vm.prank(admin);
        uint256 grantId = fundora.createGrant("Expiring Grant", "Desc", 1, titles, descs, amounts, deadline);

        // Fund it
        usdc.mint(admin, 10e6);
        vm.startPrank(admin);
        usdc.approve(address(fundora), 10e6);
        fundora.fundGrant(grantId);
        vm.stopPrank();

        // Warp past the deadline
        vm.warp(block.timestamp + 2);

        // Anyone can call expireGrant
        vm.prank(anyone);
        fundora.expireGrant(grantId);

        Fundora.Grant memory g = fundora.getGrant(grantId);
        assertEq(uint8(g.status), uint8(Fundora.GrantStatus.Cancelled), "grant Cancelled via expire");

        // Funder (admin) should have refund queued
        assertEq(fundora.pendingFunderRefunds(admin), 10e6, "funder refund queued");
    }

    // =======================================================================
    // 12b. testExpireGrantReverts_NotExpired
    // =======================================================================
    function testExpireGrantReverts_NotExpired() public {
        // A grant without a deadline should not be expirable
        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);

        vm.prank(anyone);
        vm.expectRevert(Fundora.NotExpired.selector);
        fundora.expireGrant(grantId);
    }

    // =======================================================================
    // 13. testGetGrantsBatch
    // =======================================================================
    function testGetGrantsBatch() public {
        // Create 3 grants with distinct titles
        string[]  memory titles  = new string[](1);
        string[]  memory descs   = new string[](1);
        uint256[] memory amounts = new uint256[](1);
        titles[0] = "M"; descs[0] = "D"; amounts[0] = 10e6;

        vm.prank(admin);
        fundora.createGrant("Alpha", "D", 1, titles, descs, amounts, 0);
        vm.prank(admin);
        fundora.createGrant("Beta",  "D", 1, titles, descs, amounts, 0);
        vm.prank(admin);
        fundora.createGrant("Gamma", "D", 1, titles, descs, amounts, 0);

        // getGrantsBatch(1, 3) → 3 elements
        Fundora.Grant[] memory batch = fundora.getGrantsBatch(1, 3);
        assertEq(batch.length, 3, "batch length 3");
        assertEq(batch[0].title, "Alpha");
        assertEq(batch[1].title, "Beta");
        assertEq(batch[2].title, "Gamma");

        // getGrantsBatch(1, 52) → should revert BatchTooLarge (toId - fromId = 51 > 50)
        // But first we need grantCount >= 52; if not, it reverts with InvalidGrant first.
        // The contract checks InvalidGrant (toId > grantCount) BEFORE BatchTooLarge.
        // So we test with a valid range that exceeds 50 entries.
        // Create enough grants to make toId=52 valid is expensive; instead test the
        // batch size check with fromId=1, toId=52 which will hit InvalidGrant since
        // grantCount=3. The instructions say "revert BatchTooLarge" — let's check the
        // actual contract ordering:
        //   if (fromId == 0 || toId < fromId || toId > grantCount) revert InvalidGrant();
        //   if (toId - fromId > 50) revert BatchTooLarge();
        // So with grantCount=3, toId=52 → InvalidGrant first.
        // We need 52 grants OR we call with fromId=1 toId=52 only AFTER creating 52.
        // Cheapest: use a range that is valid index-wise but >50 wide.
        // Create 51 more grants (batch call = 52 total).
        for (uint256 i = 0; i < 50; i++) {
            vm.prank(admin);
            fundora.createGrant("X", "D", 1, titles, descs, amounts, 0);
        }
        // grantCount is now 53
        vm.expectRevert(Fundora.BatchTooLarge.selector);
        fundora.getGrantsBatch(1, 52);
    }

    // =======================================================================
    // 14. testMaxMilestones
    // =======================================================================
    function testMaxMilestones() public {
        // 21 milestones → MaxMilestonesExceeded
        string[]  memory titles21  = new string[](21);
        string[]  memory descs21   = new string[](21);
        uint256[] memory amounts21 = new uint256[](21);
        for (uint256 i = 0; i < 21; i++) {
            titles21[i] = "M"; descs21[i] = "D"; amounts21[i] = 10e6;
        }
        vm.prank(admin);
        vm.expectRevert(Fundora.MaxMilestonesExceeded.selector);
        fundora.createGrant("Big", "D", 21, titles21, descs21, amounts21, 0);

        // 20 milestones → success
        string[]  memory titles20  = new string[](20);
        string[]  memory descs20   = new string[](20);
        uint256[] memory amounts20 = new uint256[](20);
        for (uint256 i = 0; i < 20; i++) {
            titles20[i] = "M"; descs20[i] = "D"; amounts20[i] = 10e6;
        }
        vm.prank(admin);
        uint256 grantId = fundora.createGrant("Max", "D", 20, titles20, descs20, amounts20, 0);
        assertGt(grantId, 0, "grant created with 20 milestones");
    }

    // =======================================================================
    // Bonus: testZeroRequiredApprovalsReverts (constructor guard)
    // =======================================================================
    function testZeroRequiredApprovalsReverts() public {
        vm.expectRevert(Fundora.ZeroAmount.selector);
        new Fundora(address(usdc), admin, 0);
    }

    // =======================================================================
    // Bonus: testMilestoneRejectedStatus_PartialRejections
    // Tests that a single rejection with 3 reviewers / RA=2 does NOT auto-reject
    // (threshold = 3-2=1, so need >1 = 2 rejections).
    // =======================================================================
    function testMilestoneNotAutoRejectedBelowThreshold() public {
        // reviewerCount = 1 currently; add 2 more → reviewerCount = 3
        vm.prank(admin);
        fundora.addReviewer(reviewer2);
        address reviewer3 = makeAddr("reviewer3");
        vm.prank(admin);
        fundora.addReviewer(reviewer3);
        // setRequiredApprovals = 2
        vm.prank(admin);
        fundora.setRequiredApprovals(2);
        // Threshold: rejections > 3-2 = 1, i.e. need >=2 rejections

        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);
        _applyForGrant(grantId, builder);
        _submitEvidence(grantId, 0, builder, "ev");

        // One rejection → threshold not reached
        _review(grantId, 0, reviewer1, false);
        Fundora.Milestone memory m = fundora.getMilestone(grantId, 0);
        assertEq(uint8(m.status), uint8(Fundora.MilestoneStatus.SubmittedForReview), "still in review");

        // Second rejection → threshold reached (rejections=2 > 1)
        _review(grantId, 0, reviewer2, false);
        m = fundora.getMilestone(grantId, 0);
        assertEq(uint8(m.status), uint8(Fundora.MilestoneStatus.Rejected), "now rejected");
    }

    // =======================================================================
    // Bonus: testCancelOpenGrant (not yet funded)
    // =======================================================================
    function testCancelOpenGrant() public {
        uint256 grantId = _createStandardGrant();

        vm.prank(admin);
        fundora.cancelGrant(grantId);

        Fundora.Grant memory g = fundora.getGrant(grantId);
        assertEq(uint8(g.status), uint8(Fundora.GrantStatus.Cancelled));
        // No funder → no refund queued
        assertEq(fundora.pendingFunderRefunds(admin), 0);
    }

    // =======================================================================
    // Bonus: testApplyForGrantTwiceReverts
    // =======================================================================
    function testApplyForGrantTwiceReverts() public {
        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);
        _applyForGrant(grantId, builder);

        vm.prank(anyone);
        vm.expectRevert(Fundora.InvalidStatus.selector);
        fundora.applyForGrant(grantId);
    }

    // =======================================================================
    // Bonus: testClaimPaymentZeroReverts
    // =======================================================================
    function testClaimPaymentZeroReverts() public {
        vm.prank(builder);
        vm.expectRevert(Fundora.ZeroAmount.selector);
        fundora.claimPayment();
    }

    // =======================================================================
    // Bonus: testClaimFunderRefundZeroReverts
    // =======================================================================
    function testClaimFunderRefundZeroReverts() public {
        vm.prank(anyone);
        vm.expectRevert(Fundora.NoRefundDue.selector);
        fundora.claimFunderRefund();
    }

    // =======================================================================
    // Bonus: testOnlyAdminModifier
    // =======================================================================
    function testOnlyAdminModifier() public {
        vm.prank(anyone);
        vm.expectRevert(Fundora.NotAdmin.selector);
        fundora.pause();
    }

    // =======================================================================
    // Bonus: testOnlyReviewerModifier
    // =======================================================================
    function testOnlyReviewerModifier() public {
        uint256 grantId = _createStandardGrant();
        _fundGrant(grantId);
        _applyForGrant(grantId, builder);
        _submitEvidence(grantId, 0, builder, "ev");

        vm.prank(anyone);
        vm.expectRevert(Fundora.NotReviewer.selector);
        fundora.reviewMilestone(grantId, 0, true);
    }

    // =======================================================================
    // 24. testRemoveReviewerQuorumGuard
    // =======================================================================
    function testRemoveReviewerQuorumGuard() public {
        // reviewerCount = 1, requiredApprovals = 1
        // Removing reviewer1 would leave 0 < 1 => InsufficientApprovers
        vm.prank(admin);
        vm.expectRevert(Fundora.InsufficientApprovers.selector);
        fundora.removeReviewer(reviewer1);

        // Add reviewer2 -> reviewerCount = 2
        vm.prank(admin);
        fundora.addReviewer(reviewer2);

        // Now removing reviewer2 succeeds (2 - 1 >= 1)
        vm.prank(admin);
        fundora.removeReviewer(reviewer2);
        assertFalse(fundora.isReviewer(reviewer2));
        assertEq(fundora.reviewerCount(), 1);
    }

    // =======================================================================
    // 25. testTransferAdmin
    // =======================================================================
    function testTransferAdmin() public {
        address newAdmin = makeAddr("newAdmin");

        // Non-admin cannot transfer
        vm.prank(anyone);
        vm.expectRevert(Fundora.NotAdmin.selector);
        fundora.transferAdmin(newAdmin);

        // Admin cannot transfer to zero address
        vm.prank(admin);
        vm.expectRevert(Fundora.ZeroAddress.selector);
        fundora.transferAdmin(address(0));

        // Admin transfers to newAdmin
        vm.prank(admin);
        fundora.transferAdmin(newAdmin);
        assertEq(fundora.admin(), newAdmin);

        // Old admin can no longer perform admin tasks
        vm.prank(admin);
        vm.expectRevert(Fundora.NotAdmin.selector);
        fundora.pause();

        // New admin can pause
        vm.prank(newAdmin);
        fundora.pause();
        assertTrue(fundora.paused());
    }
}
