// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract TrustVault is ReentrancyGuard, Ownable {
    mapping(address => uint256) public deposits;
    uint256 public totalBalance;
    IERC20 public usdcToken;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Release(address indexed recipient, uint256 amount);
    event Refund(address indexed user, uint256 amount);

    constructor(address _usdcTokenAddress) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcTokenAddress);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Deposit amount must be greater than 0");
        
        // Transfer USDC from user to this contract
        bool transferred = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(transferred, "USDC transfer failed");
        
        deposits[msg.sender] += amount;
        totalBalance += amount;
        
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(deposits[msg.sender] >= amount, "Insufficient deposit balance");
        
        deposits[msg.sender] -= amount;
        totalBalance -= amount;
        
        bool transferred = usdcToken.transfer(msg.sender, amount);
        require(transferred, "USDC transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }

    function release(address recipient, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Release amount must be greater than 0");
        require(totalBalance >= amount, "Insufficient contract balance");
        require(recipient != address(0), "Invalid recipient address");
        
        totalBalance -= amount;
        
        bool transferred = usdcToken.transfer(recipient, amount);
        require(transferred, "USDC transfer failed");
        
        emit Release(recipient, amount);
    }

    function refund(address user, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Refund amount must be greater than 0");
        require(deposits[user] >= amount, "Insufficient user deposit");
        
        deposits[user] -= amount;
        totalBalance -= amount;
        
        bool transferred = usdcToken.transfer(user, amount);
        require(transferred, "USDC transfer failed");
        
        emit Refund(user, amount);
    }

    function getBalance(address user) external view returns (uint256) {
        return deposits[user];
    }

    function getTotalBalance() external view returns (uint256) {
        return totalBalance;
    }

    // Function to get USDC token address
    function getUSDCTokenAddress() external view returns (address) {
        return address(usdcToken);
    }
}
