# 去中心化金融(DeFi)全栈项目

## 项目概述
集成智能合约、后端服务和前端界面的完整DeFi解决方案，支持代币交易、流动性池管理和质押挖矿功能。

## 技术栈
- **前端**: React 18 + TypeScript + Chakra UI
- **后端**: Go 1.19 + Gin框架
- **智能合约**: Solidity 0.8.20 + Foundry开发套件
- **区块链交互**: Ethers.js + Web3-React

## 快速启动
### 环境要求
- Node.js 18.x
- Go 1.19+
- Foundry (智能合约开发)
- 本地以太坊节点（如Ganache）

```bash
# 安装项目依赖
前端模块：
cd frontend && npm install

后端模块：
cd backend && go mod tidy

智能合约：
cd contracts && forge install
```

### 启动开发环境
```bash
# 启动前端
cd frontend && npm run dev

# 启动后端
cd backend && go run main.go

# 部署合约（本地网络）
cd contracts && forge script script/Deploy.s.sol --broadcast
```

## 项目架构
```
online_DeFi/
├── frontend/       # 前端应用
├── backend/        # Go后端服务
│   ├── api/        # API路由
│   ├── handlers/   # 业务逻辑处理
│   └── services/   # 数据服务层
└── contracts/      # Solidity智能合约
    ├── src/        # 合约源码
    │   ├── amm/    # 自动做市商合约
    │   └── staking # 质押挖矿合约
    └── test/       # 合约测试用例

## 网络配置
在.env文件中配置网络参数：
```
LOCAL_CHAIN_ID=1337
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/
TESTNET_RPC_URL=https://eth-sepolia.g.alchemy.com/
```

## 智能合约交互
1. 部署合约到指定网络
2. 在前端配置合约地址：
```typescript
// frontend/src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  AMM: '0x...',
  LIQUIDITY_MINING: '0x...'
}
```

## 测试与验证
```bash
# 运行前端测试
cd frontend && npm test

# 运行合约测试
cd contracts && forge test -vv

# 压力测试后端API
cd backend && go test -v ./...
```
