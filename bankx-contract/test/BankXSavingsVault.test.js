import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import { network } from "hardhat";

const { ethers } = await network.create();
const [owner, depositor] = await ethers.getSigners();

describe("BankXSavingsVault", function () {
  let token;
  let vault;

  beforeEach(async function () {
    const Token = await ethers.getContractFactory("BankXToken");
    token = await Token.deploy(owner.address, owner.address);
    await token.waitForDeployment();

    const Vault = await ethers.getContractFactory("BankXSavingsVault");
    vault = await Vault.deploy(await token.getAddress());
    await vault.waitForDeployment();

    await token.transfer(depositor.address, ethers.parseEther("1000"));
  });

  it("mints and redeems shares at the ERC-4626 conversion rate", async function () {
    const assets = ethers.parseEther("100");
    await token.connect(depositor).approve(await vault.getAddress(), assets);

    await vault.connect(depositor).deposit(assets, depositor.address);

    expect(await vault.balanceOf(depositor.address)).to.equal(assets);
    expect(await vault.convertToAssets(assets)).to.equal(assets);
    expect(await vault.maxWithdraw(depositor.address)).to.equal(assets);

    await vault.connect(depositor).redeem(assets, depositor.address, depositor.address);
    expect(await token.balanceOf(depositor.address)).to.equal(ethers.parseEther("1000"));
  });
});