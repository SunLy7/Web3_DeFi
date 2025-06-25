// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title 自动做市商(AMM)接口
 * @dev 定义AMM核心功能的接口
 */
interface IAMM {
    /**
     * @dev 添加流动性到池中
     * @param tokenAAmount 代币A的数量
     * @param tokenBAmount 代币B的数量
     * @return liquidity 获得的流动性代币数量
     */
    function addLiquidity(uint256 tokenAAmount, uint256 tokenBAmount) external returns (uint256 liquidity);

    /**
     * @dev 移除流动性从池中
     * @param liquidityAmount 要销毁的流动性代币数量
     * @return amountA 返回的代币A数量
     * @return amountB 返回的代币B数量
     */
    function removeLiquidity(uint256 liquidityAmount) external returns (uint256 amountA, uint256 amountB);

    /**
     * @dev 用代币A交换代币B
     * @param amountIn 输入的代币A数量
     * @param minAmountOut 期望得到的最小代币B数量
     * @return amountOut 实际得到的代币B数量
     */
    function swapAForB(uint256 amountIn, uint256 minAmountOut) external returns (uint256 amountOut);

    /**
     * @dev 用代币B交换代币A
     * @param amountIn 输入的代币B数量
     * @param minAmountOut 期望得到的最小代币A数量
     * @return amountOut 实际得到的代币A数量
     */
    function swapBForA(uint256 amountIn, uint256 minAmountOut) external returns (uint256 amountOut);

    /**
     * @dev 获取当前池中的代币储备量
     * @return reserveA 代币A的储备量
     * @return reserveB 代币B的储备量
     */
    function getReserves() external view returns (uint256 reserveA, uint256 reserveB);

    /**
     * @dev 获取交易的输出量
     * @param amountIn 输入数量
     * @param reserveIn 输入代币储备
     * @param reserveOut 输出代币储备
     * @return amountOut 计算得到的输出数量
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut);

    /**
     * @dev 当流动性被添加时触发
     */
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);

    /**
     * @dev 当流动性被移除时触发
     */
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);

    /**
     * @dev 当代币交换发生时触发
     */
    event Swap(address indexed sender, uint256 amountIn, uint256 amountOut, bool isAToB);
} 