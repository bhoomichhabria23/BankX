import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import { network } from "hardhat";

const { ethers } = await network.create();
const [owner, treasury, alice, spender] = await ethers.getSigners();

describe("BankXToken", function () {
  let token;

  beforeEach(async function () {
    const Token = await ethers.getContractFactory("BankXToken");
    token = await Token.deploy(treasury.address, owner.address);
    await token.waitForDeployment();
  });

  it("mints the fixed supply once and supports ERC-20 allowances", async function () {
    const supply = ethers.parseEther("1000000");
    const allocation = ethers.parseEther("250");

    expect(await token.totalSupply()).to.equal(supply);
    expect(await token.balanceOf(treasury.address)).to.equal(supply);
    expect(token.interface.fragments.some((fragment) => fragment.name === "mint"))
      .to.equal(false);

    await token.connect(treasury).approve(spender.address, allocation);
    await token.connect(spender).transferFrom(treasury.address, alice.address, allocation);

    expect(await token.balanceOf(alice.address)).to.equal(allocation);
    expect(await token.allowance(treasury.address, spender.address)).to.equal(0n);
  });

  it("tracks snapshot voting power only for eligible, non-excluded balances", async function () {
    const eligibleBalance = ethers.parseEther("100");

    await token.setGovernanceExcluded(treasury.address, true);
    await token.connect(treasury).transfer(alice.address, eligibleBalance - 1n);
    const belowThresholdTimepoint = await token.clock();

    await token.connect(treasury).transfer(alice.address, 1n);
    const eligibleTimepoint = await token.clock();

    await ethers.provider.send("evm_mine", []);

    expect(await token.getPastVotes(alice.address, belowThresholdTimepoint)).to.equal(0n);
    expect(await token.getPastVotes(alice.address, eligibleTimepoint)).to.equal(eligibleBalance);
    expect(await token.getPastTotalSupply(eligibleTimepoint)).to.equal(eligibleBalance);
  });

  it("rejects governance exclusions from non-owners", async function () {
    await expect(
      token.connect(alice).setGovernanceExcluded(alice.address, true),
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });
});