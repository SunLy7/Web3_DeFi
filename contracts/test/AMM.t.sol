// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/tokens/TestToken.sol";
import "../src/amm/SimpleAMM.sol";

contract AMMTest is Test {
    // 测试代币
    TestToken public tokenA;
    TestToken public tokenB;
    
    // AMM合约
    SimpleAMM public amm;
    
    // 测试账户
    address public admin = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    
    // 初始代币数量
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18;
    
    function setUp() public {
        // 设置admin为测试合约执行者
        vm.startPrank(admin);
        
        // 部署测试代币
        tokenA = new TestToken("Token A", "TKNA", 18, INITIAL_SUPPLY / 10**18);
        tokenB = new TestToken("Token B", "TKNB", 18, INITIAL_SUPPLY / 10**18);
        
        // 部署AMM合约
        amm = new SimpleAMM(address(tokenA), address(tokenB));
        
        // 给测试用户转账代币
        tokenA.transfer(user1, INITIAL_SUPPLY / 10);
        tokenB.transfer(user1, INITIAL_SUPPLY / 10);
        tokenA.transfer(user2, INITIAL_SUPPLY / 10);
        tokenB.transfer(user2, INITIAL_SUPPLY / 10);
        
        vm.stopPrank();
    }
    
    function testInitialState() public view {
        // 验证代币部署
        assert(keccak256(bytes(tokenA.symbol())) == keccak256(bytes("TKNA")));
        assert(keccak256(bytes(tokenB.symbol())) == keccak256(bytes("TKNB")));
        
        // 验证AMM设置
        assert(address(amm.tokenA()) == address(tokenA));
        assert(address(amm.tokenB()) == address(tokenB));
        
        // 验证用户余额
        assert(tokenA.balanceOf(user1) == INITIAL_SUPPLY / 10);
        assert(tokenB.balanceOf(user1) == INITIAL_SUPPLY / 10);
        assert(tokenA.balanceOf(user2) == INITIAL_SUPPLY / 10);
        assert(tokenB.balanceOf(user2) == INITIAL_SUPPLY / 10);
    }
    
    function testAddLiquidity() public {
        // 用户1添加流动性
        uint256 amountA = 100 * 10**18;
        uint256 amountB = 200 * 10**18;
        
        vm.startPrank(user1);
        
        // 授权AMM合约使用代币
        tokenA.approve(address(amm), amountA);
        tokenB.approve(address(amm), amountB);
        
        // 添加流动性
        uint256 liquidity = amm.addLiquidity(amountA, amountB);
        
        vm.stopPrank();
        
        // 验证流动性代币发放
        assertGt(liquidity, 0);
        assertEq(amm.balanceOf(user1), liquidity);
        
        // 验证储备量更新
        (uint256 reserveA, uint256 reserveB) = amm.getReserves();
        assertEq(reserveA, amountA);
        assertEq(reserveB, amountB);
    }
    
    function testSwapAForB() public {
        // 首先添加流动性
        testAddLiquidity();
        
        // 用户2进行交换
        uint256 amountIn = 10 * 10**18;
        uint256 expectedOut = amm.getAmountOut(amountIn, 100 * 10**18, 200 * 10**18);
        
        vm.startPrank(user2);
        
        // 授权AMM合约使用代币
        tokenA.approve(address(amm), amountIn);
        
        // 交换代币
        uint256 amountOut = amm.swapAForB(amountIn, 0);
        
        vm.stopPrank();
        
        // 验证输出数量
        assertEq(amountOut, expectedOut);
        
        // 验证储备量更新
        (uint256 reserveA, uint256 reserveB) = amm.getReserves();
        assertEq(reserveA, 100 * 10**18 + amountIn);
        assertEq(reserveB, 200 * 10**18 - amountOut);
    }
    
    function testSwapBForA() public {
        // 首先添加流动性
        testAddLiquidity();
        
        // 用户2进行交换
        uint256 amountIn = 20 * 10**18;
        uint256 expectedOut = amm.getAmountOut(amountIn, 200 * 10**18, 100 * 10**18);
        
        vm.startPrank(user2);
        
        // 授权AMM合约使用代币
        tokenB.approve(address(amm), amountIn);
        
        // 交换代币
        uint256 amountOut = amm.swapBForA(amountIn, 0);
        
        vm.stopPrank();
        
        // 验证输出数量
        assertEq(amountOut, expectedOut);
        
        // 验证储备量更新
        (uint256 reserveA, uint256 reserveB) = amm.getReserves();
        assertEq(reserveA, 100 * 10**18 - amountOut);
        assertEq(reserveB, 200 * 10**18 + amountIn);
    }
    
    function testRemoveLiquidity() public {
        // 首先添加流动性
        testAddLiquidity();
        
        uint256 liquidityAmount = amm.balanceOf(user1);
        
        vm.startPrank(user1);
        
        // 授权AMM合约使用LP代币
        amm.approve(address(amm), liquidityAmount);
        
        // 移除流动性
        (uint256 amountA, uint256 amountB) = amm.removeLiquidity(liquidityAmount);
        
        vm.stopPrank();
        
        // 验证返回的代币数量（允许有一点精度误差）
        assertApproxEqRel(amountA, 100 * 10**18, 0.01e18); // 允许1%的误差
        assertApproxEqRel(amountB, 200 * 10**18, 0.01e18); // 允许1%的误差
        
        // 由于最小流动性锁定，我们跳过储备量的精确验证
        // 只需验证大部分流动性已被移除
        (uint256 reserveA, uint256 reserveB) = amm.getReserves();
        assertLt(reserveA, 100 * 10**18 / 100); // 剩余不超过原来的1%
        assertLt(reserveB, 200 * 10**18 / 100); // 剩余不超过原来的1%
    }
} 