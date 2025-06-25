# DeFi 前端应用

这是一个基于React和Web3的去中心化金融(DeFi)应用前端，实现了代币交易、流动性池和质押挖矿等功能。

## 功能特点

- 代币交换：使用自动做市商(AMM)进行代币兑换
- 流动性池：添加/移除流动性，查看流动池信息
- 质押挖矿：通过质押LP代币获取挖矿奖励
- 钱包连接：支持MetaMask等兼容Web3钱包

## 技术栈

- React 18
- TypeScript
- Vite
- Chakra UI
- Ethers.js
- Web3-React

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

或者使用快捷脚本:

```bash
./run.sh
```

然后在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 连接智能合约

该前端应用需要连接到以下智能合约:

1. ERC20代币合约
2. AMM(自动做市商)合约
3. 质押挖矿合约

默认连接到本地区块链网络(localhost:8545)，也可以配置为连接测试网或主网。

## 项目结构

```
frontend/
  ├── src/
  │   ├── components/       # 可重用组件
  │   ├── context/          # React上下文
  │   ├── hooks/            # 自定义钩子
  │   ├── pages/            # 页面组件
  │   ├── services/         # API服务
  │   └── utils/            # 工具函数
  ├── public/               # 静态资源
  ├── vite.config.ts        # Vite配置
  ├── tsconfig.json         # TypeScript配置
  └── package.json          # 项目依赖
``` 