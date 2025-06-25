import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider as EthersWeb3Provider } from '@ethersproject/providers';

// MetaMask注入连接器
export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 1337, 31337], // 主网、测试网和本地网络ID
});

// Web3上下文类型
interface Web3ContextType {
  connect: () => Promise<void>;
  disconnect: () => void;
  account: string | null;
  chainId: number | undefined;
  active: boolean;
  error: Error | undefined;
  library: EthersWeb3Provider | undefined;
}

// 创建上下文
const Web3Context = createContext<Web3ContextType | null>(null);

// 上下文提供者属性
interface Web3ProviderProps {
  children: ReactNode;
}

// Web3提供者组件
export const Web3ProviderComponent: React.FC<Web3ProviderProps> = ({ children }) => {
  const { activate, deactivate, account, chainId, active, error, library } = useWeb3React<EthersWeb3Provider>();
  const [tried, setTried] = useState(false);

  // 尝试自动连接
  useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        setTried(true);
      }
    });
  }, [activate]);

  // 如果连接成功，设置tried为true
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  // 连接钱包函数
  const connect = async () => {
    try {
      await activate(injected);
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  // 断开连接函数
  const disconnect = () => {
    deactivate();
  };

  // 提供状态和功能
  const contextValue: Web3ContextType = {
    connect,
    disconnect,
    account: account || null,
    chainId,
    active,
    error,
    library,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

// 自定义钩子，用于在组件中访问上下文
export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 