import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { getTokenBalance } from '../services/web3Service';

/**
 * 自定义钩子，用于获取指定代币的余额
 * @param tokenAddress 代币合约地址
 * @returns 代币余额与加载状态
 */
export const useTokenBalance = (tokenAddress: string) => {
  const { account, library, active } = useWeb3React();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // 如果未连接钱包或无代币地址，不加载数据
    if (!active || !account || !library || !tokenAddress) {
      setBalance('0');
      return;
    }

    let mounted = true;

    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const tokenBalance = await getTokenBalance(library, tokenAddress, account);
        
        if (mounted) {
          setBalance(tokenBalance);
        }
      } catch (error) {
        console.error('Error fetching token balance:', error);
        if (mounted) {
          setBalance('0');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBalance();

    // 监听区块变化，更新余额
    const updateBalanceOnBlock = () => {
      fetchBalance();
    };

    library.on('block', updateBalanceOnBlock);

    return () => {
      mounted = false;
      // 取消区块监听
      library.removeListener('block', updateBalanceOnBlock);
    };
  }, [account, library, active, tokenAddress]);

  return { balance, isLoading };
};

export default useTokenBalance; 