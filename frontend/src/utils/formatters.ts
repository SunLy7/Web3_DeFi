import { ethers } from 'ethers';

/**
 * 格式化地址显示
 * 0x1234...5678
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * 格式化数字，添加千位符
 */
export const formatNumber = (value: string | number): string => {
  if (!value && value !== 0) return '0';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';
  
  // 数字超过1000用逗号分隔
  if (Math.abs(num) >= 1000) {
    return num.toLocaleString();
  }
  
  // 小数点后精度控制
  if (Math.abs(num) < 0.001 && num !== 0) {
    return '< 0.001';
  }
  
  // 保留合适的小数位
  const decimalPlaces = Math.abs(num) < 1 ? 4 : 2;
  return num.toFixed(decimalPlaces);
};

/**
 * 格式化代币数量显示，考虑精度
 */
export const formatTokenAmount = (
  amount: string | ethers.BigNumber,
  decimals: number = 18
): string => {
  try {
    let formattedAmount;
    
    if (typeof amount === 'string') {
      if (amount === '' || isNaN(parseFloat(amount))) {
        return '0';
      }
      formattedAmount = ethers.utils.parseUnits(amount, decimals);
    } else {
      formattedAmount = amount;
    }
    
    const humanReadable = ethers.utils.formatUnits(formattedAmount, decimals);
    return formatNumber(humanReadable);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

/**
 * 格式化百分比
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * 格式化价格变化
 */
export const formatPriceChange = (change: number): string => {
  if (isNaN(change)) return '0%';
  
  const formattedChange = change.toFixed(2);
  if (change > 0) {
    return `+${formattedChange}%`;
  } else if (change < 0) {
    return `${formattedChange}%`;
  }
  return '0%';
}; 