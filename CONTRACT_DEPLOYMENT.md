# Trust Vault Smart Contract Deployment

This document explains how to deploy Trust Vault smart contract on Base Sepolia with USDC support.

## 🚀 Quick Start

### 1. Setup Environment Variables

Create a `.env` file in root directory:

```bash
# Base Sepolia Deployment
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# WalletConnect Project ID (for RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 2. Deploy Contract

```bash
# Compile contract
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy-vault.js --network baseSepolia
```

### 3. Update Contract Address

After deployment, update contract address in `lib/contracts/vault.ts`:

```typescript
export const TRUST_VAULT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS" as const
```

## 🔧 Contract Features

The Trust Vault contract provides:

- **USDC Escrow**: USDC tokens held in smart contract until release conditions met
- **Owner Control**: Only contract owner can release funds to recipients
- **User Withdrawals**: Users can withdraw their own USDC deposits
- **Refund Function**: Owner can refund users if needed
- **Reentrancy Protection**: Prevents reentrancy attacks
- **Event Logging**: All operations emit events for tracking

## 📋 Contract Functions

### Public Functions
- `deposit(uint256 amount)` - Deposit USDC into vault (requires prior approval)
- `withdraw(uint256 amount)` - Withdraw your own USDC funds
- `getBalance(address user)` - Check user's deposit balance
- `getTotalBalance()` - Check total vault balance
- `getUSDCTokenAddress()` - Get the USDC token address used by contract

### Owner Functions
- `release(address recipient, uint256 amount)` - Release USDC to recipient
- `refund(address user, uint256 amount)` - Refund user's USDC deposit

## 🌐 Network Configuration

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **USDC Token**: 0x7169D38820dfd117C3FA1f22a697dBA58d90BA069

## 🎯 Integration with Frontend

The frontend integrates with contract through:

1. **Wagmi Hooks**: For wallet connection and contract interaction
2. **RainbowKit**: For wallet UI and connection
3. **Custom Hooks**: `useVaultDeposit`, `useVaultBalance`, etc.
4. **USDC Approval**: Two-step process (approve → deposit)

## � USDC Deposit Flow

1. **User enters amount** in USDC (not ETH)
2. **Check USDC balance** in user's wallet
3. **Approve USDC spending** for the vault contract
4. **Deposit USDC** to the vault contract
5. **Transaction confirmation** and tracking

## �� Security Considerations

- Contract uses OpenZeppelin's `ReentrancyGuard`
- Only owner can release funds (escrow control)
- All operations are event-emitted for transparency
- Input validation on all functions
- USDC token approval system for security

## 📊 Gas Optimization

- Contract optimized for minimal gas usage
- Uses packed structs where possible
- Efficient balance tracking with mappings
- USDC token operations instead of ETH transfers

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
3. Test USDC approval and deposit flow
4. Deploy to Base Mainnet (production)

## 🚨 Important Notes

- Always test on testnet first
- Never commit private keys to version control
- Use hardware wallets for mainnet deployments
- Verify contract source code on Basescan
- USDC has 6 decimal places (not 18 like ETH)
- Two-step approval process required for USDC deposits

## 💡 USDC vs ETH

- **Before**: Users deposited ETH directly to contract
- **Now**: Users approve and deposit USDC tokens
- **Benefits**: Stable value, predictable fees, better UX
- **Trade-offs**: Requires approval step, token dependencies
