import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import { network } from "hardhat";

const { ethers } = await network.create();
const [owner, treasury, proposer, voter, outsider] = await ethers.getSigners();

describe("BankXGovernance", function () {
  let token;
  let manager;
  let amm;
  let governance;

  beforeEach(async function () {
    const Token = await ethers.getContractFactory("BankXToken");
    token = await Token.deploy(treasury.address, owner.address);
    await token.waitForDeployment();

    const Manager = await ethers.getContractFactory("BankXLoanManager");
    manager = await Manager.deploy(treasury.address);
    await manager.waitForDeployment();

    const Usdc = await ethers.getContractFactory("MockUSDC");
    const usdc = await Usdc.deploy();
    await usdc.waitForDeployment();
    const Amm = await ethers.getContractFactory("BankXAMM");
    amm = await Amm.deploy(await token.getAddress(), await usdc.getAddress());
    await amm.waitForDeployment();

    const Governance = await ethers.getContractFactory("BankXGovernance");
    governance = await Governance.deploy(await token.getAddress(), [await manager.getAddress(), await amm.getAddress()]);
    await governance.waitForDeployment();

    await token.setGovernanceExcluded(treasury.address, true);
    await token.setGovernanceExcluded(await governance.getAddress(), true);
    await manager.configureGovernance(await governance.getAddress());
    await amm.configureGovernance(await governance.getAddress());
    await token.connect(treasury).transfer(proposer.address, ethers.parseEther("100"));
    await token.connect(treasury).transfer(voter.address, ethers.parseEther("100"));
  });

  async function createParameterProposal() {
    const callData = manager.interface.encodeFunctionData("setLoanParameters", [
      ethers.parseEther("0.75"),
      400,
      20 * 24 * 60 * 60,
    ]);
    await governance.connect(proposer).propose(
      [await manager.getAddress()],
      [callData],
      "Reduce future loan exposure",
    );
  }

  it("uses prior-block voting snapshots and executes passed actions after the delay", async function () {
    await createParameterProposal();
    const proposal = await governance.getProposal(1n);

    expect(proposal.snapshotBlock).to.equal((await ethers.provider.getBlockNumber()) - 1);
    await governance.connect(voter).castVote(1n, true);
    await expect(governance.connect(voter).castVote(1n, true))
      .to.be.revertedWithCustomError(governance, "AlreadyVoted");

    await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    expect(await governance.state(1n)).to.equal(2n);

    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    expect(await governance.state(1n)).to.equal(4n);

    await governance.connect(outsider).execute(1n);
    expect(await manager.maxLoanAmount()).to.equal(ethers.parseEther("0.75"));
    expect(await manager.interestBps()).to.equal(400n);
    expect(await governance.state(1n)).to.equal(5n);
  });

  it("rejects proposers below the voting threshold and actions outside the allowlist", async function () {
    await expect(
      governance.connect(outsider).propose(
        [await manager.getAddress()],
        [manager.interface.encodeFunctionData("setLoanParameters", [1n, 1n, 1n])],
        "Insufficient proposer balance",
      ),
    ).to.be.revertedWithCustomError(governance, "InsufficientVotingPower");

    await expect(
      governance.connect(proposer).propose(
        [await token.getAddress()],
        [token.interface.encodeFunctionData("transfer", [outsider.address, 1n])],
        "Not an allowlisted target",
      ),
    ).to.be.revertedWithCustomError(governance, "InvalidProposal");
  });

  it("defeats a proposal that fails its eligible-voting quorum", async function () {
    await createParameterProposal();
    await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    expect(await governance.state(1n)).to.equal(3n);
  });

  it("executes a governed AMM fee reduction only after the voting and timelock delays", async function () {
    const callData = amm.interface.encodeFunctionData("setFeeBps", [20]);
    await governance.connect(proposer).propose(
      [await amm.getAddress()],
      [callData],
      "Reduce the AMM swap fee",
    );
    await governance.connect(voter).castVote(1n, true);

    await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    expect(await governance.state(1n)).to.equal(2n);
    await expect(governance.execute(1n)).to.be.revertedWithCustomError(governance, "ProposalNotReady");

    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    await governance.execute(1n);
    expect(await amm.feeBps()).to.equal(20n);
  });
});