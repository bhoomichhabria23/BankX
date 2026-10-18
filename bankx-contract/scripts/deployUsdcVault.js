import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const { chainId } = await ethers.provider.getNetwork();
  const chainKey = chainId.toString();
  const manifestPath = resolve("../bankx/src/config/deployments.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const deployment = manifest[chainKey];

  if (!deployment?.usdc || !ethers.isAddress(deployment.usdc)) {
    throw new Error(`No configured USDC token address exists for chain ${chainKey}.`);
  }
  if ((await ethers.provider.getCode(deployment.usdc)) === "0x") {
    throw new Error(`No USDC contract code exists at ${deployment.usdc} on chain ${chainKey}.`);
  }
  if (deployment.BankXUsdcVault) {
    throw new Error(`A USDC vault is already configured for chain ${chainKey}; refusing to overwrite it.`);
  }

  const Vault = await ethers.getContractFactory("BankXUsdcVault");
  const vault = await Vault.deploy(deployment.usdc);
  await vault.waitForDeployment();

  deployment.BankXUsdcVault = await vault.getAddress();
  deployment.usdcVaultDeployedAt = new Date().toISOString();
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`BankX USDC vault deployed on chain ${chainKey}:`);
  console.log(JSON.stringify({
    asset: deployment.usdc,
    vault: deployment.BankXUsdcVault,
  }, null, 2));
  console.log(`Frontend manifest updated: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
