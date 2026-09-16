import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying PredictionMarket with deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarketFactory.deploy(deployer.address);
  await predictionMarket.waitForDeployment();

  const contractAddress = await predictionMarket.getAddress();
  console.log("PredictionMarket successfully deployed to:", contractAddress);

  const artifactPath = path.join(__dirname, "../artifacts/contracts/PredictionMarket.sol/PredictionMarket.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Artifact not found at: " + artifactPath);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abiString = JSON.stringify(artifact.abi, null, 2);

  const webLibDir = path.join(__dirname, "../../web/lib");
  const webContractsDir = path.join(__dirname, "../../web/contracts");

  if (!fs.existsSync(webLibDir)) {
    fs.mkdirSync(webLibDir, { recursive: true });
  }

  if (!fs.existsSync(webContractsDir)) {
    fs.mkdirSync(webContractsDir, { recursive: true });
  }

  const jsonExportPath = path.join(webContractsDir, "PredictionMarket.json");
  fs.writeFileSync(jsonExportPath, JSON.stringify({ address: contractAddress, abi: artifact.abi }, null, 2));
  console.log("Exported contract ABI to:", jsonExportPath);

  const tsExportContent = `export const PREDICTION_MARKET_ADDRESS =
  (process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as \`0x\${string}\`) ||
  ("${contractAddress}" as \`0x\${string}\`);

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

export const PREDICTION_MARKET_ABI = ${abiString} as const;
`;

  const tsExportPath = path.join(webLibDir, "contracts.ts");
  fs.writeFileSync(tsExportPath, tsExportContent);
  console.log("Exported TypeScript contract configuration to:", tsExportPath);

  console.log("Arbiscan Sepolia verification command:");
  console.log("npx hardhat verify --network arbitrumSepolia " + contractAddress + " " + deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
