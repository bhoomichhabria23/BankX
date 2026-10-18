import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import { network } from "hardhat";

const { ethers } = await network.create();
const [owner, treasury, staker, governance] = await ethers.getSigners();

describe("BankXStaking", function () {
  let token;
  let staking;

  beforeEach(async function () {
    const Token = await ethers.getContractFactory("BankXToken");
    token = await Token.deploy(treasury.address, owner.address);
    await token.waitForDeployment();

    const Staking = await ethers.getContractFactory("BankXStaking");
    staking = await Staking.deploy(await token.getAddress(), treasury.address);
    await staking.waitForDeployment();

    await token.connect(treasury).approve(await staking.getAddress(), ethers.parseEther("90000"));
    await staking.connect(treasury).fundRewards(ethers.parseEther("90000"));
    await token.connect(treasury).transfer(staker.address, ethers.parseEther("1000"));
    await token.connect(staker).approve(await staking.getAddress(), ethers.MaxUint256);
    await staking.configureGovernance(governance.address);
  });

  it("pre-funds, accrues, claims rewards, and permits unstaking", async function () {
    const stakeAmount = ethers.parseEther("100");
    await staking.connect(staker).stake(stakeAmount);
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine", []);

    expect(await staking.earned(staker.address)).to.be.gt(0n);
    const balanceBefore = await token.balanceOf(staker.address);
    await staking.connect(staker).claimRewards();
    expect(await token.balanceOf(staker.address)).to.be.gt(balanceBefore);

    await staking.connect(staker).unstake(stakeAmount);
    expect(await staking.stakedBalance(staker.address)).to.equal(0n);
  });

  it("caps reward funding at the approved budget", async function () {
    await expect(
      staking.connect(treasury).fundRewards(1n),
    ).to.be.revertedWithCustomError(staking, "RewardBudgetExceeded");
  });
});