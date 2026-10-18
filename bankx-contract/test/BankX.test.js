import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import { network } from "hardhat";

const { ethers } = await network.create();
const [owner, depositor, borrower] = await ethers.getSigners();

describe("BankX legacy ETH contract", function () {
  let bankX;

  beforeEach(async function () {
    const BankX = await ethers.getContractFactory("BankX");
    bankX = await BankX.deploy();
    await bankX.waitForDeployment();
  });

  it("preserves deposit and withdrawal accounting", async function () {
    const amount = ethers.parseEther("1");
    await bankX.connect(depositor).deposit({ value: amount });
    expect(await bankX.savings(depositor.address)).to.equal(amount);
    expect(await bankX.totalPool()).to.equal(amount);

    await bankX.connect(depositor).withdraw(ethers.parseEther("0.4"));
    expect(await bankX.savings(depositor.address)).to.equal(ethers.parseEther("0.6"));
    expect(await bankX.totalPool()).to.equal(ethers.parseEther("0.6"));
  });

  it("preserves immediate pool-funded loans and partial repayment", async function () {
    const poolAmount = ethers.parseEther("2");
    const loanAmount = ethers.parseEther("1");
    await bankX.connect(depositor).deposit({ value: poolAmount });

    await bankX.connect(borrower).requestLoan(loanAmount);
    expect(await bankX.loans(borrower.address)).to.equal(loanAmount);
    expect(await bankX.totalPool()).to.equal(loanAmount);

    await bankX.connect(borrower).repayLoan({ value: ethers.parseEther("0.25") });
    expect(await bankX.loans(borrower.address)).to.equal(ethers.parseEther("0.75"));
    expect(await bankX.totalPool()).to.equal(ethers.parseEther("1.25"));
  });

  it("preserves direct borrowing without collateral or DAO approval", async function () {
    await bankX.connect(depositor).deposit({ value: ethers.parseEther("1") });
    await bankX.connect(borrower).requestLoan(ethers.parseEther("1"));

    expect(await bankX.savings(borrower.address)).to.equal(0n);
    expect(await bankX.loans(borrower.address)).to.equal(ethers.parseEther("1"));
  });

  it("reverts a depositor withdrawal when pooled ETH is currently borrowed", async function () {
    const amount = ethers.parseEther("1");
    await bankX.connect(depositor).deposit({ value: amount });
    await bankX.connect(borrower).requestLoan(amount);

    await expect(bankX.connect(depositor).withdraw(amount)).to.be.revertedWithPanic(0x11);
    expect(await bankX.savings(depositor.address)).to.equal(amount);
    expect(await bankX.totalPool()).to.equal(0n);
  });
});