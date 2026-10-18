import { network } from "hardhat";

async function main() {
  console.log("Deploying BankX...");

  const { ethers } = await network.create();

  const BankX = await ethers.getContractFactory("BankX");

  const bankX = await BankX.deploy();

  await bankX.waitForDeployment();

  const address = await bankX.getAddress();

  console.log("BankX deployed to:");
  console.log(address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});