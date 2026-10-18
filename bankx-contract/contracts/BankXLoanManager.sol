// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BankXLoanManager is ReentrancyGuard {
    uint256 public constant MAX_LOAN_AMOUNT = 1 ether;
    uint256 public constant MAX_INTEREST_BPS = 500;
    uint256 public constant MAX_LOAN_TERM = 30 days;
    uint256 private constant BPS_DENOMINATOR = 10_000;

    enum RequestStatus {
        None,
        Pending,
        Approved,
        Rejected,
        Cancelled
    }

    struct LoanRequest {
        address borrower;
        uint256 amount;
        uint256 createdAt;
        RequestStatus status;
    }

    struct Loan {
        uint256 principal;
        uint256 accruedInterest;
        uint256 lastAccruedAt;
        uint256 maturity;
        uint256 interestBps;
        uint256 termSeconds;
        bool active;
    }

    address public immutable treasury;
    address public immutable setupAuthority;
    address public governance;
    uint256 public maxLoanAmount = MAX_LOAN_AMOUNT;
    uint256 public interestBps = MAX_INTEREST_BPS;
    uint256 public loanTerm = MAX_LOAN_TERM;
    uint256 public nextRequestId = 1;

    mapping(uint256 requestId => LoanRequest) public requests;
    mapping(address borrower => uint256 requestId) public pendingRequest;
    mapping(address borrower => Loan) public loans;

    error Unauthorized();
    error InvalidConfiguration();
    error InvalidLoanAmount();
    error ExistingLoanOrRequest();
    error RequestNotPending();
    error InsufficientPoolFunds();
    error NoActiveLoan();
    error InvalidRepayment();
    error LoanTransferFailed();

    event GovernanceConfigured(address indexed governance);
    event PoolFunded(address indexed funder, uint256 amount);
    event LoanRequested(uint256 indexed requestId, address indexed borrower, uint256 amount);
    event LoanApproved(uint256 indexed requestId, address indexed borrower, uint256 amount, uint256 maturity);
    event LoanRejected(uint256 indexed requestId, address indexed borrower);
    event LoanRequestCancelled(uint256 indexed requestId, address indexed borrower);
    event LoanRepaid(address indexed borrower, uint256 amount, uint256 principalRemaining, uint256 interestRemaining);
    event LoanParametersUpdated(uint256 maxLoanAmount, uint256 interestBps, uint256 loanTerm);

    constructor(address treasury_) {
        if (treasury_ == address(0)) revert InvalidConfiguration();
        treasury = treasury_;
        setupAuthority = msg.sender;
    }

    modifier onlyGovernance() {
        if (msg.sender != governance || governance == address(0)) revert Unauthorized();
        _;
    }

    function configureGovernance(address governance_) external {
        if (msg.sender != setupAuthority || governance != address(0) || governance_ == address(0)) {
            revert Unauthorized();
        }
        governance = governance_;
        emit GovernanceConfigured(governance_);
    }

    function fundPool() external payable {
        if (msg.sender != treasury) revert Unauthorized();
        if (msg.value == 0) revert InvalidLoanAmount();
        emit PoolFunded(msg.sender, msg.value);
    }

    function submitLoanRequest(uint256 amount) external returns (uint256 requestId) {
        if (amount == 0 || amount > maxLoanAmount) revert InvalidLoanAmount();
        if (loans[msg.sender].active || pendingRequest[msg.sender] != 0) revert ExistingLoanOrRequest();

        requestId = nextRequestId++;
        requests[requestId] = LoanRequest({
            borrower: msg.sender,
            amount: amount,
            createdAt: block.timestamp,
            status: RequestStatus.Pending
        });
        pendingRequest[msg.sender] = requestId;
        emit LoanRequested(requestId, msg.sender, amount);
    }

    function approveRequest(uint256 requestId) external onlyGovernance nonReentrant {
        LoanRequest storage request = requests[requestId];
        if (request.status != RequestStatus.Pending) revert RequestNotPending();
        if (loans[request.borrower].active) revert ExistingLoanOrRequest();
        if (address(this).balance < request.amount) revert InsufficientPoolFunds();

        request.status = RequestStatus.Approved;
        pendingRequest[request.borrower] = 0;
        loans[request.borrower] = Loan({
            principal: request.amount,
            accruedInterest: 0,
            lastAccruedAt: block.timestamp,
            maturity: block.timestamp + loanTerm,
            interestBps: interestBps,
            termSeconds: loanTerm,
            active: true
        });

        (bool success,) = payable(request.borrower).call{value: request.amount}("");
        if (!success) revert LoanTransferFailed();
        emit LoanApproved(requestId, request.borrower, request.amount, loans[request.borrower].maturity);
    }

    function rejectRequest(uint256 requestId) external onlyGovernance {
        LoanRequest storage request = requests[requestId];
        if (request.status != RequestStatus.Pending) revert RequestNotPending();

        request.status = RequestStatus.Rejected;
        pendingRequest[request.borrower] = 0;
        emit LoanRejected(requestId, request.borrower);
    }

    function cancelRequest(uint256 requestId) external {
        LoanRequest storage request = requests[requestId];
        if (request.status != RequestStatus.Pending || request.borrower != msg.sender) {
            revert RequestNotPending();
        }

        request.status = RequestStatus.Cancelled;
        pendingRequest[msg.sender] = 0;
        emit LoanRequestCancelled(requestId, msg.sender);
    }

    function repay() external payable nonReentrant {
        Loan storage loan = loans[msg.sender];
        if (!loan.active) revert NoActiveLoan();
        if (msg.value == 0) revert InvalidRepayment();

        _accrue(loan);
        uint256 interestPayment = Math.min(msg.value, loan.accruedInterest);
        uint256 principalPayment = msg.value - interestPayment;
        if (principalPayment > loan.principal) revert InvalidRepayment();

        loan.accruedInterest -= interestPayment;
        loan.principal -= principalPayment;
        if (loan.principal == 0 && loan.accruedInterest == 0) {
            loan.active = false;
        }

        emit LoanRepaid(msg.sender, msg.value, loan.principal, loan.accruedInterest);
    }

    function repaymentQuote(address borrower) external view returns (uint256 principal, uint256 interest, uint256 total) {
        Loan memory loan = loans[borrower];
        if (!loan.active) return (0, 0, 0);

        principal = loan.principal;
        interest = loan.accruedInterest + _pendingInterest(loan);
        total = principal + interest;
    }

    function isOverdue(address borrower) external view returns (bool) {
        Loan storage loan = loans[borrower];
        return loan.active && block.timestamp >= loan.maturity;
    }

    function setLoanParameters(uint256 maxAmount, uint256 nextInterestBps, uint256 nextTerm)
        external
        onlyGovernance
    {
        if (
            maxAmount == 0 || maxAmount > MAX_LOAN_AMOUNT
                || nextInterestBps > MAX_INTEREST_BPS
                || nextTerm == 0 || nextTerm > MAX_LOAN_TERM
        ) revert InvalidConfiguration();

        maxLoanAmount = maxAmount;
        interestBps = nextInterestBps;
        loanTerm = nextTerm;
        emit LoanParametersUpdated(maxAmount, nextInterestBps, nextTerm);
    }

    function _accrue(Loan storage loan) private {
        uint256 accrualEnd = Math.min(block.timestamp, loan.maturity);
        if (accrualEnd <= loan.lastAccruedAt || loan.principal == 0) return;

        uint256 elapsed = accrualEnd - loan.lastAccruedAt;
        loan.accruedInterest += Math.mulDiv(
            loan.principal,
            loan.interestBps * elapsed,
            BPS_DENOMINATOR * loan.termSeconds
        );
        loan.lastAccruedAt = accrualEnd;
    }

    function _pendingInterest(Loan memory loan) private view returns (uint256) {
        uint256 accrualEnd = Math.min(block.timestamp, loan.maturity);
        if (accrualEnd <= loan.lastAccruedAt || loan.principal == 0) return 0;

        return Math.mulDiv(
            loan.principal,
            loan.interestBps * (accrualEnd - loan.lastAccruedAt),
            BPS_DENOMINATOR * loan.termSeconds
        );
    }
}