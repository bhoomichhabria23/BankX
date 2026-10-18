// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BankX {
    address public owner;

    mapping(address => uint256) public savings;
    mapping(address => uint256) public loans;

    uint256 public totalPool;

    event Deposited(
        address indexed user,
        uint256 amount
    );

    event Withdrawn(
        address indexed user,
        uint256 amount
    );

    event LoanRequested(
        address indexed borrower,
        uint256 amount
    );

    event LoanRepaid(
        address indexed borrower,
        uint256 amount
    );

    constructor() {
        owner = msg.sender;
    }

    // -------------------------
    // DEPOSIT
    // -------------------------
    function deposit() external payable {
        require(
            msg.value > 0,
            "Deposit must be greater than 0"
        );

        savings[msg.sender] += msg.value;
        totalPool += msg.value;

        emit Deposited(
            msg.sender,
            msg.value
        );
    }

    // -------------------------
    // WITHDRAW
    // -------------------------
    function withdraw(uint256 amount) external {
        require(
            amount > 0,
            "Amount must be greater than 0"
        );

        require(
            savings[msg.sender] >= amount,
            "Insufficient savings"
        );

        // Update state BEFORE sending ETH
        savings[msg.sender] -= amount;
        totalPool -= amount;

        // Send ETH safely
        (bool success, ) =
            payable(msg.sender).call{value: amount}("");

        require(
            success,
            "Transfer failed"
        );

        emit Withdrawn(
            msg.sender,
            amount
        );
    }

    // -------------------------
    // REQUEST LOAN
    // -------------------------
    function requestLoan(uint256 amount) external {
        require(
            amount > 0,
            "Loan must be greater than 0"
        );

        require(
            amount <= totalPool,
            "Insufficient pool funds"
        );

        // Update state BEFORE sending ETH
        totalPool -= amount;
        loans[msg.sender] += amount;

        // Send loan safely
        (bool success, ) =
            payable(msg.sender).call{value: amount}("");

        require(
            success,
            "Loan transfer failed"
        );

        emit LoanRequested(
            msg.sender,
            amount
        );
    }

    // -------------------------
    // REPAY LOAN
    // -------------------------
    function repayLoan() external payable {
        require(
            loans[msg.sender] > 0,
            "No active loan"
        );

        require(
            msg.value > 0,
            "Repayment must be greater than 0"
        );

        require(
            msg.value <= loans[msg.sender],
            "Repayment exceeds loan"
        );

        loans[msg.sender] -= msg.value;
        totalPool += msg.value;

        emit LoanRepaid(
            msg.sender,
            msg.value
        );
    }

    // -------------------------
    // VIEW FUNCTIONS
    // -------------------------

    function getSavings()
        external
        view
        returns (uint256)
    {
        return savings[msg.sender];
    }

    function getLoan()
        external
        view
        returns (uint256)
    {
        return loans[msg.sender];
    }

    function getPoolBalance()
        external
        view
        returns (uint256)
    {
        return totalPool;
    }
}