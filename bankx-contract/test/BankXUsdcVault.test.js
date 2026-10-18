import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import { network } from "hardhat";

const { ethers } = await network.create();
const [, depositor, receiver] = await ethers.getSigners();

describe("BankXUsdcVault", function () {
  let usdc;
  let vault;

  beforeEach(async function () {
    const Usdc = await ethers.getContractFactory("MockUSDC");
    usdc = await Usdc.deploy();
    await usdc.waitForDeployment();

    const Vault = await ethers.getContractFactory("BankXUsdcVault");
    vault = await Vault.deploy(await usdc.getAddress());
    await vault.waitForDeployment();

    await usdc.mint(depositor.address, 1_000_000_000n);
    await usdc.connect(depositor).approve(await vault.getAddress(), ethers.MaxUint256);
  });

  it("uses six-decimal USDC and issues equivalent shares on the first deposit", async function () {
    const depositAmount = 250_000_000n;

    await vault.connect(depositor).deposit(depositAmount, depositor.address);

    expect(await vault.asset()).to.equal(await usdc.getAddress());
    expect(await vault.decimals()).to.equal(6n);
    expect(await vault.totalAssets()).to.equal(depositAmount);
    expect(await vault.balanceOf(depositor.address)).to.equal(depositAmount);
    expect(await vault.convertToAssets(await vault.balanceOf(depositor.address))).to.equal(depositAmount);
  });

  it("supports preview, withdraw, and redeem without claiming yield", async function () {
    const depositAmount = 250_000_000n;
    await vault.connect(depositor).deposit(depositAmount, depositor.address);

    const withdrawAmount = 40_000_000n;
    expect(await vault.previewWithdraw(withdrawAmount)).to.equal(withdrawAmount);
    await vault.connect(depositor).withdraw(withdrawAmount, receiver.address, depositor.address);
    expect(await usdc.balanceOf(receiver.address)).to.equal(withdrawAmount);
    expect(await vault.totalAssets()).to.equal(depositAmount - withdrawAmount);

    const redeemAmount = 10_000_000n;
    expect(await vault.previewRedeem(redeemAmount)).to.equal(redeemAmount);
    await vault.connect(depositor).redeem(redeemAmount, receiver.address, depositor.address);
    expect(await usdc.balanceOf(receiver.address)).to.equal(withdrawAmount + redeemAmount);
    expect(await vault.totalAssets()).to.equal(depositAmount - withdrawAmount - redeemAmount);
  });

  it("rejects a zero-address or non-six-decimal asset", async function () {
    const Vault = await ethers.getContractFactory("BankXUsdcVault");
    await expect(Vault.deploy(ethers.ZeroAddress))
      .to.be.revertedWithCustomError(Vault, "InvalidUsdcToken");

    const BankToken = await ethers.getContractFactory("BankXToken");
    const bank = await BankToken.deploy(depositor.address, depositor.address);
    await bank.waitForDeployment();
    await expect(Vault.deploy(await bank.getAddress()))
      .to.be.revertedWithCustomError(Vault, "InvalidUsdcToken");
  });
});
