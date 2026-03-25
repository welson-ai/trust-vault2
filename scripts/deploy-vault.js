#!/usr/bin/env node

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TrustVault contract...");

  // Get network from command line or default to baseSepolia
  const network = process.env.NETWORK || "baseSepolia";
  
  // USDC Contract addresses
  const usdcAddresses = {
    "baseSepolia": "0x7169D38820dfd117C3FA1f22a697dBA58d90BA069",
    "base": "0xd9aAEc86BC6510E7020C6d87d3661f6a95bA"
  };
  
  const usdcAddress = usdcAddresses[network];
  console.log(`Deploying to ${network} with USDC address: ${usdcAddress}`);
  
  // Deploy contract with USDC address
  const TrustVault = await ethers.getContractFactory("TrustVault");
  const trustVault = await TrustVault.deploy(usdcAddress);

  await TrustVault.deployed();

  console.log("TrustVault deployed to:", TrustVault.address);
  console.log("USDC Token Address:", usdcAddress);
  console.log("Transaction hash:", TrustVault.deployTransaction.hash);
  
  // Save deployment info
  const deploymentInfo = {
    address: TrustVault.address,
    usdcTokenAddress: usdcAddress,
    transactionHash: TrustVault.deployTransaction.hash,
    network: network,
    deployedAt: new Date().toISOString()
  };
  
  // In a real project, you'd save this to a file or database
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
  
  // Verify the contract works
  const deployedUSDCAddress = await TrustVault.getUSDCTokenAddress();
  console.log("Verified USDC address in contract:", deployedUSDCAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
