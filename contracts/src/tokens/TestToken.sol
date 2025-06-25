// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./ERC20.sol";

/**
 * @title 测试代币
 * @dev 一个简单的代币用于测试AMM功能
 */
contract TestToken is ERC20 {
    // 构造函数，初始化代币名称、符号和小数位数，并铸造初始供应量给调用者
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name_, symbol_, decimals_) {
        _mint(msg.sender, initialSupply * 10**decimals_);
    }

    /**
     * @dev 允许任何人铸造代币（仅用于测试目的）
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
} 