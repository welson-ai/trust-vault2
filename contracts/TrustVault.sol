// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TrustVault is ReentrancyGuard, Ownable {
    mapping(address => uint256) public deposits;
    uint256 public totalBalance;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Release(address indexed recipient, uint256 amount);
    event Refund(address indexed user, uint256 amount);

    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        deposits[msg.sender] += msg.value;
        totalBalance += msg.value;
        
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(deposits[msg.sender] >= amount, "Insufficient deposit balance");
        
        deposits[msg.sender] -= amount;
        totalBalance -= amount;
        
        payable(msg.sender).transfer(amount);
        
        emit Withdrawal(msg.sender, amount);
    }

    function release(address recipient, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Release amount must be greater than 0");
        require(totalBalance >= amount, "Insufficient contract balance");
        require(recipient != address(0), "Invalid recipient address");
        
        totalBalance -= amount;
        
        payable(recipient).transfer(amount);
        
        emit Release(recipient, amount);
    }

    function refund(address user, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Refund amount must be greater than 0");
        require(deposits[user] >= amount, "Insufficient user deposit");
        
        deposits[user] -= amount;
        totalBalance -= amount;
        
        payable(user).transfer(amount);
        
        emit Refund(user, amount);
    }

    function getBalance(address user) external view returns (uint256) {
        return deposits[user];
    }

    function getTotalBalance() external view returns (uint256) {
        return totalBalance;
    }

    receive() external payable {
        deposit();
    }
}
