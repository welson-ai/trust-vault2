#!/usr/bin/env node

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TrustVault contract...");

  // USDC Contract on Base Sepolia
  const usdcAddress = "0x036CbD5b381b824e568Ff7c85cE36985D8B764a";
  
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
