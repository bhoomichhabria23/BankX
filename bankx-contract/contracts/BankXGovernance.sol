// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

interface IBankXVotingToken {
    function clock() external view returns (uint48);
    function getPastVotes(address account, uint256 timepoint) external view returns (uint256);
    function getPastTotalSupply(uint256 timepoint) external view returns (uint256);
}

contract BankXGovernance {
    uint256 public constant PROPOSAL_THRESHOLD = 100 ether;
    uint256 public constant QUORUM_BPS = 1_000;
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant EXECUTION_DELAY = 1 days;
    uint256 public constant MAX_ACTIONS = 10;

    enum ProposalState {
        Unknown,
        Active,
        Queued,
        Defeated,
        Succeeded,
        Executed
    }

    struct Proposal {
        address proposer;
        uint256 snapshotBlock;
        uint256 deadline;
        uint256 executeAfter;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        string description;
    }

    struct Action {
        address target;
        bytes data;
    }

    IBankXVotingToken public immutable token;
    uint256 public proposalCount;

    mapping(address target => bool) public allowedTarget;
    mapping(uint256 proposalId => Proposal) private _proposals;
    mapping(uint256 proposalId => Action[]) private _actions;
    mapping(uint256 proposalId => mapping(address voter => bool)) public hasVoted;

    error InvalidConfiguration();
    error InvalidProposal();
    error InsufficientVotingPower();
    error ProposalNotActive();
    error AlreadyVoted();
    error ProposalNotReady();
    error ProposalCallFailed(uint256 actionIndex, bytes reason);

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        uint256 snapshotBlock,
        uint256 deadline,
        string description
    );
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address tokenAddress, address[] memory allowedTargets) {
        if (tokenAddress == address(0) || tokenAddress.code.length == 0 || allowedTargets.length == 0) {
            revert InvalidConfiguration();
        }
        token = IBankXVotingToken(tokenAddress);

        for (uint256 index; index < allowedTargets.length; ++index) {
            address target = allowedTargets[index];
            if (target == address(0) || target.code.length == 0 || allowedTarget[target]) {
                revert InvalidConfiguration();
            }
            allowedTarget[target] = true;
        }
    }

    function propose(address[] calldata targets, bytes[] calldata calldatas, string calldata description)
        external
        returns (uint256 proposalId)
    {
        if (
            targets.length == 0 || targets.length > MAX_ACTIONS
                || targets.length != calldatas.length || bytes(description).length == 0
        ) revert InvalidProposal();

        uint256 snapshotBlock = block.number - 1;
        if (token.getPastVotes(msg.sender, snapshotBlock) < PROPOSAL_THRESHOLD) {
            revert InsufficientVotingPower();
        }

        proposalId = ++proposalCount;
        uint256 deadline = block.timestamp + VOTING_PERIOD;
        _proposals[proposalId] = Proposal({
            proposer: msg.sender,
            snapshotBlock: snapshotBlock,
            deadline: deadline,
            executeAfter: deadline + EXECUTION_DELAY,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            description: description
        });

        for (uint256 index; index < targets.length; ++index) {
            if (!allowedTarget[targets[index]] || calldatas[index].length < 4) revert InvalidProposal();
            _actions[proposalId].push(Action({target: targets[index], data: calldatas[index]}));
        }

        emit ProposalCreated(proposalId, msg.sender, snapshotBlock, deadline, description);
    }

    function castVote(uint256 proposalId, bool support) external returns (uint256 weight) {
        Proposal storage proposal = _proposals[proposalId];
        if (proposal.proposer == address(0) || block.timestamp >= proposal.deadline) {
            revert ProposalNotActive();
        }
        if (hasVoted[proposalId][msg.sender]) revert AlreadyVoted();

        weight = token.getPastVotes(msg.sender, proposal.snapshotBlock);
        if (weight < PROPOSAL_THRESHOLD) revert InsufficientVotingPower();

        hasVoted[proposalId][msg.sender] = true;
        if (support) proposal.forVotes += weight;
        else proposal.againstVotes += weight;

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    function state(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage proposal = _proposals[proposalId];
        if (proposal.proposer == address(0)) return ProposalState.Unknown;
        if (proposal.executed) return ProposalState.Executed;
        if (block.timestamp < proposal.deadline) return ProposalState.Active;
        if (!_passed(proposal)) return ProposalState.Defeated;
        if (block.timestamp < proposal.executeAfter) return ProposalState.Queued;
        return ProposalState.Succeeded;
    }

    function execute(uint256 proposalId) external {
        Proposal storage proposal = _proposals[proposalId];
        if (state(proposalId) != ProposalState.Succeeded) revert ProposalNotReady();

        proposal.executed = true;
        Action[] storage actions = _actions[proposalId];
        for (uint256 index; index < actions.length; ++index) {
            (bool success, bytes memory returnData) = actions[index].target.call(actions[index].data);
            if (!success) revert ProposalCallFailed(index, returnData);
        }

        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            address proposer,
            uint256 snapshotBlock,
            uint256 deadline,
            uint256 executeAfter,
            uint256 forVotes,
            uint256 againstVotes,
            bool executed,
            string memory description
        )
    {
        Proposal storage proposal = _proposals[proposalId];
        return (
            proposal.proposer,
            proposal.snapshotBlock,
            proposal.deadline,
            proposal.executeAfter,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.description
        );
    }

    function actionCount(uint256 proposalId) external view returns (uint256) {
        return _actions[proposalId].length;
    }

    function actionAt(uint256 proposalId, uint256 index) external view returns (address target, bytes memory data) {
        Action storage action = _actions[proposalId][index];
        return (action.target, action.data);
    }

    function quorum(uint256 snapshotBlock) public view returns (uint256) {
        uint256 eligibleSupply = token.getPastTotalSupply(snapshotBlock);
        return Math.mulDiv(eligibleSupply, QUORUM_BPS, 10_000, Math.Rounding.Ceil);
    }

    function _passed(Proposal storage proposal) private view returns (bool) {
        uint256 votesCast = proposal.forVotes + proposal.againstVotes;
        return votesCast >= quorum(proposal.snapshotBlock) && proposal.forVotes * 2 > votesCast;
    }
}