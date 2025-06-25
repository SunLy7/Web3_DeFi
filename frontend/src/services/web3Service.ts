import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { getContractAddresses } from '../config/contracts';

// 合约ABI (从编译后的合约JSON文件中获取)
const ERC20_ABI = [
  // 一些常用的ERC20函数
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 amount)',
  'event Approval(address indexed owner, address indexed spender, uint256 amount)',
];

const AMM_ABI = [
  // 简化的AMM接口ABI
  'function getReserves() external view returns (uint256 reserveA, uint256 reserveB)',
  'function getTokenA() external view returns (address)',
  'function getTokenB() external view returns (address)',
  'function addLiquidity(uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin) external returns (uint256 amountA, uint256 amountB)',
  'function removeLiquidity(uint256 liquidity, uint256 amountAMin, uint256 amountBMin) external returns (uint256 amountA, uint256 amountB)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, bool fromA) external returns (uint256 amountOut)',
];

const STAKING_ABI = [
  // 简化的质押合约ABI
  'function stake(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function getReward() external',
  'function balanceOf(address account) external view returns (uint256)',
  'function earned(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function rewardRate() external view returns (uint256)',
];

// 创建合约实例
export const getTokenContract = (
  provider: Web3Provider, 
  address: string
) => {
  return new ethers.Contract(address, ERC20_ABI, provider.getSigner());
};

export const getAMMContract = (provider: Web3Provider, chainId: number) => {
  const addresses = getContractAddresses(chainId);
  return new ethers.Contract(addresses.amm, AMM_ABI, provider.getSigner());
};

export const getStakingContract = (provider: Web3Provider, chainId: number) => {
  const addresses = getContractAddresses(chainId);
  return new ethers.Contract(addresses.staking, STAKING_ABI, provider.getSigner());
};

// 获取代币余额
export const getTokenBalance = async (
  provider: Web3Provider,
  tokenAddress: string,
  account: string
): Promise<string> => {
  try {
    const tokenContract = getTokenContract(provider, tokenAddress);
    const balance = await tokenContract.balanceOf(account);
    const decimals = await tokenContract.decimals();
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
};

// 获取流动池信息
export const getPoolInfo = async (provider: Web3Provider, chainId: number) => {
  try {
    const ammContract = getAMMContract(provider, chainId);
    const reserves = await ammContract.getReserves();
    
    return {
      reserveA: reserves.reserveA.toString(),
      reserveB: reserves.reserveB.toString(),
    };
  } catch (error) {
    console.error('Error getting pool info:', error);
    return {
      reserveA: '0',
      reserveB: '0',
    };
  }
};

// 计算交换得到的代币数量
export const calculateSwapAmount = (
  amountIn: string,
  reserveIn: string,
  reserveOut: string
): string => {
  try {
    if (!amountIn || !reserveIn || !reserveOut) {
      return '0';
    }
    
    // 使用恒定乘积公式 x * y = k
    // (x + dx) * (y - dy) = x * y
    // dy = y * dx / (x + dx)
    const amountInWithFee = parseFloat(amountIn) * 0.997; // 0.3% fee
    const numerator = parseFloat(reserveOut) * amountInWithFee;
    const denominator = parseFloat(reserveIn) + amountInWithFee;
    const amountOut = numerator / denominator;
    
    return amountOut.toString();
  } catch (error) {
    console.error('Error calculating swap amount:', error);
    return '0';
  }
}; 