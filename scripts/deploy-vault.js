#!/usr/bin/env node

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TrustVault contract...");

  // USDC Contract on Base Sepolia (correct address)
  const usdcAddress = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA069";
  
  // Deploy contract with USDC address
  const TrustVault = await ethers.getContractFactory("TrustVault");
  const trustVault = await TrustVault.deploy(usdcAddress);

  await trustVault.deployed();

  console.log("TrustVault deployed to:", trustVault.address);
  console.log("USDC Token Address:", usdcAddress);
  console.log("Transaction hash:", trustVault.deployTransaction.hash);
  
  // Save deployment info
  const deploymentInfo = {
    address: trustVault.address,
    usdcTokenAddress: usdcAddress,
    transactionHash: trustVault.deployTransaction.hash,
    network: "baseSepolia",
    deployedAt: new Date().toISOString()
  };
  
  // In a real project, you'd save this to a file or database
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
  
  // Verify the contract works
  const deployedUSDCAddress = await trustVault.getUSDCTokenAddress();
  console.log("Verified USDC address in contract:", deployedUSDCAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
