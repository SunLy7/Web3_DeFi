// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/tokens/TestToken.sol";
import "../src/amm/SimpleAMM.sol";
import "../src/staking/LiquidityMining.sol";

/**
 * @title 部署脚本
 * @dev 用于部署DeFi项目的所有合约
 */
contract DeployScript is Script {
    function run() external {
        // 从私钥获取部署者地址
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // 开始广播交易
        vm.startBroadcast(deployerPrivateKey);
        
        // 部署两个测试代币
        TestToken tokenA = new TestToken("Token A", "TKNA", 18, 1000000);
        TestToken tokenB = new TestToken("Token B", "TKNB", 18, 1000000);
        
        // 部署AMM池
        SimpleAMM amm = new SimpleAMM(address(tokenA), address(tokenB));
        
        // 部署流动性挖矿合约，用TokenA作为奖励代币
        LiquidityMining liquidityMining = new LiquidityMining(address(tokenA), address(amm));

        // 向流动性挖矿合约转入奖励代币
        tokenA.transfer(address(liquidityMining), 100000 * 10**18);
        
        // 通知奖励金额，开始挖矿
        liquidityMining.notifyRewardAmount(100000 * 10**18);
        
        // 结束广播
        vm.stopBroadcast();
        
        // 输出部署的合约地址
        console.log("TokenA deployed at:", address(tokenA));
        console.log("TokenB deployed at:", address(tokenB));
        console.log("AMM Pool deployed at:", address(amm));
        console.log("Liquidity Mining deployed at:", address(liquidityMining));
    }
} 