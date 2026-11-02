import { expect } from "chai";
import { describe, it } from "mocha";
import { network } from "hardhat";

const { ethers } = await network.create();
const [owner] = await ethers.getSigners();

describe("SafePriceConsumer", function () {
  async function deployConsumer() {
    const Mock = await ethers.getContractFactory("MockV3Aggregator");
    const mock = await Mock.deploy(8, 2_000n * 10n ** 8n, owner.address);
    await mock.waitForDeployment();

    const Consumer = await ethers.getContractFactory("SafePriceConsumer");
    const consumer = await Consumer.deploy(await mock.getAddress(), 3600);
    await consumer.waitForDeployment();
    return { mock, consumer };
  }

  it("normalizes the feed price and calculates the value of an 18-decimal amount", async function () {
    const { consumer } = await deployConsumer();

    expect(await consumer.safePrice()).to.equal(ethers.parseEther("2000"));
    expect(await consumer["valueOf(uint256)"](ethers.parseEther("2"))).to.equal(
      ethers.parseEther("4000"),
    );
  });

  it("rejects zero and negative prices", async function () {
    const { mock, consumer } = await deployConsumer();

    await mock.setAnswer(0);
    await expect(consumer.safePrice()).to.be.revertedWithCustomError(
      consumer,
      "InvalidPriceAnswer",
    );

    await mock.setAnswer(-1);
    await expect(consumer.safePrice()).to.be.revertedWithCustomError(
      consumer,
      "InvalidPriceAnswer",
    );
  });

  it("rejects zero and stale update timestamps", async function () {
    const { mock, consumer } = await deployConsumer();

    await mock.setUpdatedAt(0);
    await expect(consumer.safePrice()).to.be.revertedWithCustomError(
      consumer,
      "InvalidUpdatedAt",
    );

    await mock.setUpdatedAt(1);
    await expect(consumer.safePrice()).to.be.revertedWithCustomError(
      consumer,
      "StalePrice",
    );
  });
});
