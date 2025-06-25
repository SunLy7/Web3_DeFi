// 合约地址配置
interface ContractAddresses {
  [chainId: number]: {
    tokenA: string;
    tokenB: string;
    amm: string;
    staking: string;
  };
}

// 本地开发环境的合约地址
const LOCAL_ADDRESSES = {
  tokenA: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  tokenB: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  amm: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  staking: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
};

// 测试网合约地址
const TESTNET_ADDRESSES = {
  tokenA: '0x0000000000000000000000000000000000000000',
  tokenB: '0x0000000000000000000000000000000000000000',
  amm: '0x0000000000000000000000000000000000000000',
  staking: '0x0000000000000000000000000000000000000000',
};

// 合约地址映射
export const CONTRACT_ADDRESSES: ContractAddresses = {
  // 本地开发网络
  1337: LOCAL_ADDRESSES,
  31337: LOCAL_ADDRESSES, // Hardhat网络

  // 测试网
  5: TESTNET_ADDRESSES, // Goerli
  11155111: TESTNET_ADDRESSES, // Sepolia
};

// 支持的网络ID
export const SUPPORTED_CHAIN_IDS = Object.keys(CONTRACT_ADDRESSES).map(Number);

// 获取特定链上的合约地址
export const getContractAddresses = (chainId: number) => {
  return CONTRACT_ADDRESSES[chainId] || LOCAL_ADDRESSES;
};

export default CONTRACT_ADDRESSES; 