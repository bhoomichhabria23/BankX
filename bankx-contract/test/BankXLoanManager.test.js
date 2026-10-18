import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import { network } from "hardhat";

const { ethers } = await network.create();
const [owner, treasury, governance, borrower, other] = await ethers.getSigners();

describe("BankXLoanManager", function () {
  let manager;

  beforeEach(async function () {
    const Manager = await ethers.getContractFactory("BankXLoanManager");
    manager = await Manager.deploy(treasury.address);
    await manager.waitForDeployment();
    await manager.configureGovernance(governance.address);
    await manager.connect(treasury).fundPool({ value: ethers.parseEther("2") });
  });

  it("requires a request and governance approval before funding a loan", async function () {
    const amount = ethers.parseEther("0.5");
    await manager.connect(borrower).submitLoanRequest(amount);
    await expect(manager.connect(other).approveRequest(1n))
      .to.be.revertedWithCustomError(manager, "Unauthorized");

    await manager.connect(governance).approveRequest(1n);
    const loan = await manager.loans(borrower.address);
    expect(loan.principal).to.equal(amount);
    expect(loan.active).to.equal(true);
    expect(await manager.pendingRequest(borrower.address)).to.equal(0n);
  });

  it("accrues simple interest, pays it before principal, and marks maturity overdue", async function () {
    await manager.connect(borrower).submitLoanRequest(ethers.parseEther("0.5"));
    await manager.connect(governance).approveRequest(1n);
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    const [, interest] = await manager.repaymentQuote(borrower.address);
    expect(interest).to.be.closeTo(ethers.parseEther("0.0125"), ethers.parseEther("0.000001"));

    await manager.connect(borrower).repay({ value: ethers.parseEther("0.01") });
    const loan = await manager.loans(borrower.address);
    expect(loan.principal).to.equal(ethers.parseEther("0.5"));
    expect(loan.accruedInterest).to.be.lt(interest);

    await ethers.provider.send("evm_increaseTime", [16 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    expect(await manager.isOverdue(borrower.address)).to.equal(true);
    await expect(manager.connect(borrower).submitLoanRequest(1n))
      .to.be.revertedWithCustomError(manager, "ExistingLoanOrRequest");
  });

  it("enforces the configured borrower limit and one pending request", async function () {
    await expect(manager.connect(borrower).submitLoanRequest(ethers.parseEther("1.1")))
      .to.be.revertedWithCustomError(manager, "InvalidLoanAmount");

    await manager.connect(borrower).submitLoanRequest(ethers.parseEther("1"));
    await expect(manager.connect(borrower).submitLoanRequest(1n))
      .to.be.revertedWithCustomError(manager, "ExistingLoanOrRequest");
  });
});