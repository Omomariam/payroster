const hre = require("hardhat");
const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deploying PayRoster from ${deployer.address}`);
  console.log(`Testnet balance: ${hre.ethers.formatEther(balance)} BOT`);

  const PayRoster = await hre.ethers.getContractFactory("PayRoster");
  const contract = await PayRoster.deploy(deployer.address);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const transaction = contract.deploymentTransaction();

  const deployment = {
    network: "BOT Chain Testnet",
    chainId: 968,
    address,
    deployer: deployer.address,
    transactionHash: transaction.hash,
    deployedAt: new Date().toISOString(),
  };
  const outputPath = path.join(__dirname, "..", "deployments", "bot-testnet.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(deployment, null, 2)}\n`);
  console.log(`Contract deployed: ${address}`);
  console.log(`Transaction: https://scan.bohr.life/tx/${transaction.hash}`);
}

main().catch((error) => {
  console.error(error.shortMessage || error.message);
  process.exitCode = 1;
});
