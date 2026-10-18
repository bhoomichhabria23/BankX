import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { network } from "hardhat";

const REQUIRED_CHAIN_IDS = new Set(["31337", "11155111"]);
const TOKEN_TOTAL = 1_000_000n * 10n ** 18n;
const STAKING_ALLOCATION = 90_000n * 10n ** 18n;
const MINIMUM_AMM_ALLOCATION = 10_000n * 10n ** 18n;

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();
  const { chainId } = await ethers.provider.getNetwork();
  const chainKey = chainId.toString();

  if (!REQUIRED_CHAIN_IDS.has(chainKey)) {
    throw new Error(`Unsupported chain ID ${chainKey}. Configure local 31337 or Sepolia 11155111.`);
  }

  const isLocal = chainKey === "31337";
  const maxStaleness = BigInt(requiredEnv("CHAINLINK_MAX_STALENESS_SECONDS"));
  if (maxStaleness <= 0n) throw new Error("CHAINLINK_MAX_STALENESS_SECONDS must be positive.");

  const treasuryAllocation = ethers.parseEther(process.env.BANKX_TREASURY_ALLOCATION || "900000");
  const stakingAllocation = ethers.parseEther(process.env.BANKX_STAKING_ALLOCATION || "90000");
  const ammAllocation = ethers.parseEther(process.env.BANKX_AMM_ALLOCATION || "10000");
  if (treasuryAllocation + stakingAllocation + ammAllocation !== TOKEN_TOTAL) {
    throw new Error("BANKX_TREASURY_ALLOCATION + BANKX_STAKING_ALLOCATION + BANKX_AMM_ALLOCATION must equal the fixed 1,000,000 BANK supply.");
  }
  if (stakingAllocation !== STAKING_ALLOCATION || ammAllocation < MINIMUM_AMM_ALLOCATION) {
    throw new Error("Staking allocation must match the 90,000 BANK reward cap; AMM allocation must include the 10,000 BANK seed.");
  }

  const treasuryAddress = isLocal
    ? (process.env.BANKX_TREASURY_ADDRESS || deployer.address)
    : requiredEnv("BANKX_TREASURY_ADDRESS");
  if (!ethers.isAddress(treasuryAddress)) throw new Error("BANKX_TREASURY_ADDRESS is invalid.");

  let usdcAddress;
  if (isLocal) {
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();

    const localMint = process.env.LOCAL_MOCK_USDC_MINT?.trim();
    if (localMint) {
      await mockUsdc.mint(deployer.address, ethers.parseUnits(localMint, 6));
    }
  } else {
    usdcAddress = requiredEnv("SEPOLIA_USDC_ADDRESS");
    if (!ethers.isAddress(usdcAddress) || (await ethers.provider.getCode(usdcAddress)) === "0x") {
      throw new Error("SEPOLIA_USDC_ADDRESS must identify deployed Sepolia USDC code.");
    }
  }

  let feedAddress;
  if (isLocal) {
    const mockAnswer = BigInt(requiredEnv("LOCAL_ETH_USD_ANSWER"));
    const MockFeed = await ethers.getContractFactory("MockV3Aggregator");
    const mockFeed = await MockFeed.deploy(8, mockAnswer, deployer.address);
    await mockFeed.waitForDeployment();
    feedAddress = await mockFeed.getAddress();
  } else {
    feedAddress = requiredEnv("SEPOLIA_ETH_USD_FEED");
    if (!ethers.isAddress(feedAddress) || (await ethers.provider.getCode(feedAddress)) === "0x") {
      throw new Error("SEPOLIA_ETH_USD_FEED must identify a deployed Sepolia Chainlink feed.");
    }
  }

  const Token = await ethers.getContractFactory("BankXToken");
  const token = await Token.deploy(deployer.address, deployer.address);
  await token.waitForDeployment();

  const LoanManager = await ethers.getContractFactory("BankXLoanManager");
  const loanManager = await LoanManager.deploy(treasuryAddress);
  await loanManager.waitForDeployment();

  const Vault = await ethers.getContractFactory("BankXSavingsVault");
  const vault = await Vault.deploy(await token.getAddress());
  await vault.waitForDeployment();

  const UsdcVault = await ethers.getContractFactory("BankXUsdcVault");
  const usdcVault = await UsdcVault.deploy(usdcAddress);
  await usdcVault.waitForDeployment();

  const Amm = await ethers.getContractFactory("BankXAMM");
  const amm = await Amm.deploy(await token.getAddress(), usdcAddress);
  await amm.waitForDeployment();

  const Staking = await ethers.getContractFactory("BankXStaking");
  const staking = await Staking.deploy(await token.getAddress(), treasuryAddress);
  await staking.waitForDeployment();

  const PriceFeed = await ethers.getContractFactory("BankXPriceFeed");
  const priceFeed = await PriceFeed.deploy(feedAddress, maxStaleness, chainId);
  await priceFeed.waitForDeployment();

  const Governance = await ethers.getContractFactory("BankXGovernance");
  const governance = await Governance.deploy(await token.getAddress(), [
    await loanManager.getAddress(),
    await amm.getAddress(),
    await staking.getAddress(),
  ]);
  await governance.waitForDeployment();

  await loanManager.configureGovernance(await governance.getAddress());
  await staking.configureGovernance(await governance.getAddress());
  await amm.configureGovernance(await governance.getAddress());

  const excludedAccounts = [
    treasuryAddress,
    await loanManager.getAddress(),
    await vault.getAddress(),
    await amm.getAddress(),
    await staking.getAddress(),
    await governance.getAddress(),
  ];
  for (const account of excludedAccounts) {
    if (!(await token.governanceExcluded(account))) {
      await token.setGovernanceExcluded(account, true);
    }
  }

  await token.transfer(treasuryAddress, treasuryAllocation);
  await token.transfer(await amm.getAddress(), ammAllocation);
  await token.approve(await staking.getAddress(), stakingAllocation);
  await staking.fundRewards(stakingAllocation);
  await token.transferOwnership(await governance.getAddress());

  const addresses = {
    chainId: chainKey,
    chainName: isLocal ? "Hardhat Local" : "Sepolia",
    deploymentBlock: await ethers.provider.getBlockNumber(),
    deployedAt: new Date().toISOString(),
    treasury: treasuryAddress,
    BankXToken: await token.getAddress(),
    BankXSavingsVault: await vault.getAddress(),
    BankXUsdcVault: await usdcVault.getAddress(),
    BankXAMM: await amm.getAddress(),
    BankXStaking: await staking.getAddress(),
    BankXLoanManager: await loanManager.getAddress(),
    BankXGovernance: await governance.getAddress(),
    BankXPriceFeed: await priceFeed.getAddress(),
    usdc: usdcAddress,
    usdcDecimals: 6,
    ethUsdFeed: feedAddress,
    maxStalenessSeconds: maxStaleness.toString(),
    legacyBankX: process.env.LEGACY_BANKX_ADDRESS || null,
    tokenTotal: TOKEN_TOTAL.toString(),
    tokenAllocations: {
      treasury: treasuryAllocation.toString(),
      staking: stakingAllocation.toString(),
      amm: ammAllocation.toString(),
    },
  };

  const manifestPath = resolve("../bankx/src/config/deployments.json");
  mkdirSync(dirname(manifestPath), { recursive: true });
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest[chainKey] = addresses;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Protocol deployed on chain ${chainKey}:`);
  console.log(JSON.stringify(addresses, null, 2));
  console.log(`Frontend manifest updated: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});