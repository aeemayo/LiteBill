// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LiteBill is ReentrancyGuard {
    struct Bill {
        address creator;
        address payable payee;
        uint256 totalAmount;
        uint256 shareAmount;
        uint256 totalContributed;
        uint256 participantCount;
        uint256 contributors;
        bool settled;
        bool cancelled;
        uint256 expiresAt;
        bool payoutPending;
        uint256 settlementFailedAt;
    }

    uint256 public constant SETTLEMENT_GRACE = 3 days;
    uint256 public nextBillId = 1000;

    mapping(uint256 => Bill) public bills;
    mapping(uint256 => mapping(address => bool)) public hasContributed;
    mapping(uint256 => mapping(address => uint256)) public contributionAmounts;

    event BillCreated(
        uint256 indexed billId,
        address indexed creator,
        address indexed payee,
        uint256 totalAmount,
        uint256 shareAmount,
        uint256 participantCount
    );

    event ContributionMade(
        uint256 indexed billId,
        address indexed contributor,
        uint256 amount
    );

    event BillSettled(uint256 indexed billId, uint256 settledAmount);
    event BillSettlementFailed(uint256 indexed billId, uint256 pendingAmount);
    event BillCancelled(uint256 indexed billId);
    event RefundClaimed(
        uint256 indexed billId,
        address indexed contributor,
        uint256 amount
    );

    function createBill(
        address payable _payee,
        uint256 _totalAmount,
        uint256 _participantCount
    ) external returns (uint256) {
        return _createBill(_payee, _totalAmount, _participantCount, 0);
    }

    function createBillWithExpiry(
        address payable _payee,
        uint256 _totalAmount,
        uint256 _participantCount,
        uint256 _expiresAt
    ) external returns (uint256) {
        require(_expiresAt > block.timestamp, "Invalid expiry");
        return _createBill(
            _payee,
            _totalAmount,
            _participantCount,
            _expiresAt
        );
    }

    function _createBill(
        address payable _payee,
        uint256 _totalAmount,
        uint256 _participantCount,
        uint256 _expiresAt
    ) internal returns (uint256) { 
        require(_payee != address(0), "Invalid payee");
        require(_participantCount > 0, "Invalid participant count");
        require(_totalAmount > 0, "Total amount must be greater than 0");
        require(
            _totalAmount % _participantCount == 0,
            "Total must divide equally"
        );

        uint256 shareAmount = _totalAmount / _participantCount;

        uint256 uniqueId = nextBillId;
        nextBillId += 1;

        bills[uniqueId] = Bill({
            creator: msg.sender,
            payee: _payee,
            totalAmount: _totalAmount,
            shareAmount: shareAmount,
            totalContributed: 0,
            participantCount: _participantCount,
            contributors: 0,
            settled: false,
            cancelled: false,
            expiresAt: _expiresAt,
            payoutPending: false,
            settlementFailedAt: 0
        });

        emit BillCreated(
            uniqueId,
            msg.sender,
            _payee,
            _totalAmount,
            shareAmount,
            _participantCount
        );

        return uniqueId;
    }

    function contribute(uint256 _billId) external payable nonReentrant {
        Bill storage bill = bills[_billId];

        require(bill.creator != address(0), "Bill not found");
        require(!bill.settled, "Bill already settled");
        require(!bill.cancelled, "Bill cancelled");
        require(!_isExpired(bill), "Bill expired");
        require(!hasContributed[_billId][msg.sender], "Already contributed");
        require(bill.contributors < bill.participantCount, "All paid");
        require(msg.value == bill.shareAmount, "Incorrect share amount");

        bill.totalContributed += msg.value;
        bill.contributors += 1;
        hasContributed[_billId][msg.sender] = true;
        contributionAmounts[_billId][msg.sender] = msg.value;

        emit ContributionMade(_billId, msg.sender, msg.value);

        if (
            bill.totalContributed == bill.totalAmount &&
            bill.contributors == bill.participantCount
        ) {
            uint256 payout = bill.totalContributed;
            (bool sent, ) = bill.payee.call{value: payout}("");
            if (sent) {
                bill.settled = true;
                bill.payoutPending = false;
                emit BillSettled(_billId, payout);
            } else {
                bill.payoutPending = true;
                bill.settlementFailedAt = block.timestamp;
                emit BillSettlementFailed(_billId, payout);
            }
        }
    }

    function cancelBill(uint256 _billId) external {
        Bill storage bill = bills[_billId];
        require(bill.creator != address(0), "Bill not found");
        require(msg.sender == bill.creator, "Only creator can cancel");
        require(!bill.settled, "Bill already settled");
        require(!bill.cancelled, "Bill already cancelled");

        bill.cancelled = true;
        bill.payoutPending = false;
        emit BillCancelled(_billId);
    }

    function retryPayout(uint256 _billId) external nonReentrant {
        Bill storage bill = bills[_billId];
        require(bill.creator != address(0), "Bill not found");
        require(!bill.settled, "Bill already settled");
        require(!bill.cancelled, "Bill cancelled");
        require(bill.payoutPending, "No payout pending");
        require(bill.totalContributed == bill.totalAmount, "Not fully funded");

        uint256 payout = bill.totalContributed;
        (bool sent, ) = bill.payee.call{value: payout}("");
        if (sent) {
            bill.settled = true;
            bill.payoutPending = false;
            emit BillSettled(_billId, payout);
        } else if (bill.settlementFailedAt == 0) {
            bill.settlementFailedAt = block.timestamp;
        }
    }

    function claimRefund(uint256 _billId) external nonReentrant {
        Bill storage bill = bills[_billId];
        require(bill.creator != address(0), "Bill not found");
        require(!bill.settled, "Bill already settled");
        require(
            bill.cancelled || _isExpired(bill) || _isSettlementTimedOut(bill),
            "Refunds unavailable"
        );

        uint256 amount = contributionAmounts[_billId][msg.sender];
        require(amount > 0, "No contribution to refund");

        contributionAmounts[_billId][msg.sender] = 0;
        bill.totalContributed -= amount;
        bill.contributors -= 1;
        if (bill.totalContributed < bill.totalAmount) {
            bill.payoutPending = false;
        }

        emit RefundClaimed(_billId, msg.sender, amount);
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Refund failed");
    }

    function getBillTiming(uint256 _billId)
        external
        view
        returns (uint256 expiresAt, bool cancelled, bool expired)
    {
        Bill memory bill = bills[_billId];
        require(bill.creator != address(0), "Bill not found");
        return (bill.expiresAt, bill.cancelled, _isExpired(bill));
    }

    function _isExpired(Bill memory bill) internal view returns (bool) {
        return bill.expiresAt != 0 && block.timestamp >= bill.expiresAt;
    }

    function _isSettlementTimedOut(Bill memory bill) internal view returns (bool) {
        return
            bill.payoutPending &&
            bill.settlementFailedAt != 0 &&
            block.timestamp >= bill.settlementFailedAt + SETTLEMENT_GRACE;
    }

    function getBillStatus(uint256 _billId)
        external
        view
        returns (
            address creator,
            address payee,
            uint256 totalAmount,
            uint256 shareAmount,
            uint256 totalContributed,
            uint256 contributors,
            uint256 participantCount,
            bool settled
        )
    {
        Bill memory bill = bills[_billId];
        require(bill.creator != address(0), "Bill not found");

        return (
            bill.creator,
            bill.payee,
            bill.totalAmount,
            bill.shareAmount,
            bill.totalContributed,
            bill.contributors,
            bill.participantCount,
            bill.settled
        );
    }
}
