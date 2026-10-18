import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import { network } from "hardhat";

const { ethers } = await network.create();
const [owner, provider, trader] = await ethers.getSigners();
const deadline = async () => BigInt((await ethers.provider.getBlock("latest")).timestamp + 3600);

describe("BankXAMM", function () {
  let bank;
  let usdc;
  let pool;

  beforeEach(async function () {
    const Token = await ethers.getContractFactory("BankXToken");
    bank = await Token.deploy(owner.address, owner.address);
    await bank.waitForDeployment();

    const Usdc = await ethers.getContractFactory("MockUSDC");
    usdc = await Usdc.deploy();
    await usdc.waitForDeployment();

    const Amm = await ethers.getContractFactory("BankXAMM");
    pool = await Amm.deploy(await bank.getAddress(), await usdc.getAddress());
    await pool.waitForDeployment();
    await pool.configureGovernance(owner.address);

    await bank.transfer(await pool.getAddress(), await pool.PROTOCOL_BANK_SEED());
    await bank.transfer(provider.address, ethers.parseEther("1000"));
    await bank.transfer(trader.address, ethers.parseEther("1000"));
    await usdc.mint(provider.address, 1_000_000_000n);
    await usdc.mint(trader.address, 10_000_000n);

    await usdc.connect(provider).approve(await pool.getAddress(), ethers.MaxUint256);
    await usdc.connect(trader).approve(await pool.getAddress(), ethers.MaxUint256);
    await bank.connect(provider).approve(await pool.getAddress(), ethers.MaxUint256);
    await bank.connect(trader).approve(await pool.getAddress(), ethers.MaxUint256);

    await pool.connect(provider).initializePool(
      100_000_000n,
      0n,
      1n,
      await deadline(),
    );
  });

  it("initializes with the configured BANK seed and records reserves", async function () {
    expect(await pool.reserveBank()).to.equal(await pool.PROTOCOL_BANK_SEED());
    expect(await pool.reserveUsdc()).to.equal(100_000_000n);
    expect(await pool.feeBps()).to.equal(30n);
  });

  it("allows governance to lower the swap fee but never exceed the approved cap", async function () {
    await pool.setFeeBps(20n);
    expect(await pool.feeBps()).to.equal(20n);
    await expect(pool.setFeeBps(31n)).to.be.revertedWithCustomError(pool, "InvalidFee");
    await expect(pool.connect(provider).setFeeBps(10n))
      .to.be.revertedWithCustomError(pool, "Unauthorized");
  });

  it("charges the configured swap fee, enforces min output, and syncs reserves", async function () {
    const amountIn = ethers.parseEther("10");
    const quotedOutput = await pool.quoteBankForUsdc(amountIn);

    await expect(
      pool.connect(trader).swapBankForUsdc(amountIn, quotedOutput + 1n, await deadline()),
    ).to.be.revertedWithCustomError(pool, "InsufficientOutput");

    await pool.connect(trader).swapBankForUsdc(amountIn, quotedOutput, await deadline());
    expect(await usdc.balanceOf(trader.address)).to.equal(10_000_000n + quotedOutput);
    expect(await pool.reserveBank()).to.equal(await bank.balanceOf(await pool.getAddress()));
    expect(await pool.reserveUsdc()).to.equal(await usdc.balanceOf(await pool.getAddress()));
  });

  it("mints and burns LP tokens without allowing the pool to be drained", async function () {
    const lpBalance = await pool.balanceOf(provider.address);
    const lpToRemove = lpBalance / 2n;
    await pool.connect(provider).removeLiquidity(lpToRemove, 0n, 0n, await deadline());
    expect(await pool.reserveBank()).to.equal(await bank.balanceOf(await pool.getAddress()));
    expect(await pool.reserveUsdc()).to.equal(await usdc.balanceOf(await pool.getAddress()));

    const remainingLp = await pool.balanceOf(provider.address);
    await expect(
      pool.connect(provider).removeLiquidity(remainingLp, 0n, 0n, await deadline()),
    ).to.be.revertedWithCustomError(pool, "LastLiquidityProviderCannotExit");
  });
});