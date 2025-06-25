// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title ERC20标准代币接口
 * @dev 遵循EIP-20规范 https://eips.ethereum.org/EIPS/eip-20
 */
interface IERC20 {
    /**
     * @dev 返回代币的总供应量
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev 返回账户拥有的代币数量
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev 将代币从调用者转移到指定地址
     * 返回一个布尔值，表示操作是否成功
     * 触发Transfer事件
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev 返回owner授权给spender的额度
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev 设置spender可以从调用者账户转出的代币数量
     * 返回一个布尔值，表示操作是否成功
     * 触发Approval事件
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev 从from地址转移代币到to地址，使用授权机制
     * from必须已授权给调用者足够的额度
     * 返回一个布尔值，表示操作是否成功
     * 触发Transfer事件
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    /**
     * @dev 当代币转移时触发，包括0值转账
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev 当调用approve方法设置额度时触发
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
} 