# Trust Vault Smart Contract Deployment

This document explains how to deploy the Trust Vault smart contract on Base Sepolia.

## 🚀 Quick Start

### 1. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
# Base Sepolia Deployment
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# WalletConnect Project ID (for RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 2. Deploy the Contract

```bash
# Compile the contract
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy-vault.js --network baseSepolia
```

### 3. Update Contract Address

After deployment, update the contract address in `lib/contracts/vault.ts`:

```typescript
export const TRUST_VAULT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS" as const
```

## 🔧 Contract Features

The Trust Vault contract provides:

- **Secure Escrow**: Funds held in smart contract until release conditions met
- **Owner Control**: Only contract owner can release funds to recipients
- **User Withdrawals**: Users can withdraw their own deposits
- **Refund Function**: Owner can refund users if needed
- **Reentrancy Protection**: Prevents reentrancy attacks
- **Event Logging**: All operations emit events for tracking

## 📋 Contract Functions

### Public Functions
- `deposit()` - Deposit ETH into the vault
- `withdraw(uint256 amount)` - Withdraw your own funds
- `getBalance(address user)` - Check user's deposit balance
- `getTotalBalance()` - Check total vault balance

### Owner Functions
- `release(address recipient, uint256 amount)` - Release funds to recipient
- `refund(address user, uint256 amount)` - Refund user's deposit

## 🌐 Network Configuration

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

## 🎯 Integration with Frontend

The frontend integrates with the contract through:

1. **Wagmi Hooks**: For wallet connection and contract interaction
2. **RainbowKit**: For wallet UI and connection
3. **Custom Hooks**: `useVaultDeposit`, `useVaultBalance`, etc.

## 🔒 Security Considerations

- Contract uses OpenZeppelin's `ReentrancyGuard`
- Only owner can release funds (escrow control)
- All operations are event-emitted for transparency
- Input validation on all functions

## 📊 Gas Optimization

- Contract optimized for minimal gas usage
- Uses packed structs where possible
- Efficient balance tracking with mappings

## 🧪 Testing

```bash
# Run tests
npx hardhat test

# Test coverage
npx hardhat coverage
```

## 📝 Next Steps

1. Deploy contract to Base Sepolia
2. Update contract address in frontend
3. Test Web3 integration
4. Deploy to Base Mainnet (production)

## 🚨 Important Notes

- Always test on testnet first
- Never commit private keys to version control
- Use hardware wallets for mainnet deployments
- Verify contract source code on Basescan
