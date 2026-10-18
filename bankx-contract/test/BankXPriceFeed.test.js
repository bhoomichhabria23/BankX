import { expect } from "chai";
import { describe, it } from "mocha";
import { network } from "hardhat";

const { ethers } = await network.create();
const [owner] = await ethers.getSigners();

describe("BankXPriceFeed", function () {
  it("normalizes the feed price and rejects stale or invalid answers", async function () {
    const Mock = await ethers.getContractFactory("MockV3Aggregator");
    const mock = await Mock.deploy(8, 2_000n * 10n ** 8n, owner.address);
    await mock.waitForDeployment();

    const chainId = (await ethers.provider.getNetwork()).chainId;
    const Oracle = await ethers.getContractFactory("BankXPriceFeed");
    const oracle = await Oracle.deploy(await mock.getAddress(), 3600, chainId);
    await oracle.waitForDeployment();

    const [price] = await oracle.latestEthUsd();
    expect(price).to.equal(ethers.parseEther("2000"));

    await mock.setAnswer(0);
    await expect(oracle.latestEthUsd()).to.be.revertedWithCustomError(oracle, "InvalidPriceAnswer");

    await mock.setAnswer(2_000n * 10n ** 8n);
    await mock.setUpdatedAt(1);
    await expect(oracle.latestEthUsd()).to.be.revertedWithCustomError(oracle, "StalePrice");
  });
});