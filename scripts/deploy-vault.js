#!/usr/bin/env node

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TrustVault contract...");

  // Deploy the contract
  const TrustVault = await ethers.getContractFactory("TrustVault");
  const trustVault = await TrustVault.deploy();

  await trustVault.deployed();

  console.log("TrustVault deployed to:", trustVault.address);
  console.log("Transaction hash:", trustVault.deployTransaction.hash);
  
  // Save the deployment info
  const deploymentInfo = {
    address: trustVault.address,
    transactionHash: trustVault.deployTransaction.hash,
    network: "baseSepolia",
    deployedAt: new Date().toISOString()
  };
  
  // In a real project, you'd save this to a file or database
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
