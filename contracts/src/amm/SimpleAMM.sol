// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../interfaces/IAMM.sol";
import "../interfaces/IERC20.sol";
import "../tokens/ERC20.sol";

/**
 * @title 简单自动做市商(AMM)实现
 * @dev 使用恒定乘积公式(x*y=k)实现AMM功能
 */
contract SimpleAMM is IAMM, ERC20 {
    // 交易手续费：0.3%
    uint256 private constant FEE_DENOMINATOR = 1000;
    uint256 private constant FEE_NUMERATOR = 3;

    // 代币A和代币B
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    // 最小流动性，防止第一个提供者独占份额
    uint256 private constant MINIMUM_LIQUIDITY = 1000;
    // 固定的最小流动性接收者，避免使用address(0)
    address private constant MINIMUM_LIQUIDITY_RECEIVER = address(1);
    
    // 代币储备量
    uint256 private reserveA;
    uint256 private reserveB;

    /**
     * @dev 构造函数
     * @param _tokenA 代币A地址
     * @param _tokenB 代币B地址
     */
    constructor(address _tokenA, address _tokenB) 
        ERC20("SimpleAMM LP", "SLP", 18) 
    {
        require(_tokenA != address(0), "TokenA cannot be zero address");
        require(_tokenB != address(0), "TokenB cannot be zero address");
        require(_tokenA != _tokenB, "Tokens must be different");
        
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    /**
     * @dev 获取储备量
     */
    function getReserves() public view override returns (uint256, uint256) {
        return (reserveA, reserveB);
    }

    /**
     * @dev 根据恒定乘积公式计算交换后的输出量
     * 公式: amountOut = (reserveOut * amountIn * (1000 - FEE_NUMERATOR)) / (reserveIn * 1000 + amountIn * (1000 - FEE_NUMERATOR))
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure override returns (uint256) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient reserves");

        // 计算扣除手续费后的输入量
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        // 计算分子和分母
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        // 计算输出量
        return numerator / denominator;
    }

    /**
     * @dev 更新储备量
     */
    function _updateReserves(uint256 _reserveA, uint256 _reserveB) private {
        reserveA = _reserveA;
        reserveB = _reserveB;
    }

    /**
     * @dev 添加流动性
     */
    function addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired
    ) external override returns (uint256 liquidity) {
        // 转移代币到合约
        require(tokenA.transferFrom(msg.sender, address(this), amountADesired), "TokenA transfer failed");
        require(tokenB.transferFrom(msg.sender, address(this), amountBDesired), "TokenB transfer failed");

        // 获取合约中实际的代币余额
        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));
        uint256 amountA = balanceA - reserveA;
        uint256 amountB = balanceB - reserveB;

        // 计算流动性代币数量
        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            // 首次添加流动性
            liquidity = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            _mint(MINIMUM_LIQUIDITY_RECEIVER, MINIMUM_LIQUIDITY); // 锁定最小流动性到一个非零地址
        } else {
            // 按比例计算流动性
            liquidity = min(
                (amountA * _totalSupply) / reserveA,
                (amountB * _totalSupply) / reserveB
            );
        }

        require(liquidity > 0, "Insufficient liquidity minted");
        
        // 铸造流动性代币
        _mint(msg.sender, liquidity);
        
        // 更新储备量
        _updateReserves(balanceA, balanceB);
        
        emit LiquidityAdded(msg.sender, amountA, amountB, liquidity);
        
        return liquidity;
    }

    /**
     * @dev 移除流动性
     */
    function removeLiquidity(
        uint256 liquidityAmount
    ) external override returns (uint256 amountA, uint256 amountB) {
        // 检查提供的流动性代币数量
        require(liquidityAmount > 0, "Insufficient liquidity amount");
        
        // 计算应返回的代币数量
        uint256 _totalSupply = totalSupply();
        amountA = (liquidityAmount * reserveA) / _totalSupply;
        amountB = (liquidityAmount * reserveB) / _totalSupply;
        
        require(amountA > 0 && amountB > 0, "Insufficient tokens returned");
        
        // 销毁流动性代币
        _burn(msg.sender, liquidityAmount);
        
        // 转移代币给用户
        require(tokenA.transfer(msg.sender, amountA), "TokenA transfer failed");
        require(tokenB.transfer(msg.sender, amountB), "TokenB transfer failed");
        
        // 更新储备量
        _updateReserves(tokenA.balanceOf(address(this)), tokenB.balanceOf(address(this)));
        
        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidityAmount);
        
        return (amountA, amountB);
    }

    /**
     * @dev 使用代币A交换代币B
     */
    function swapAForB(
        uint256 amountIn,
        uint256 minAmountOut
    ) external override returns (uint256 amountOut) {
        require(amountIn > 0, "Insufficient input amount");
        
        // 计算交换后得到的代币B数量
        amountOut = getAmountOut(amountIn, reserveA, reserveB);
        require(amountOut >= minAmountOut, "Insufficient output amount");
        
        // 转移代币
        require(tokenA.transferFrom(msg.sender, address(this), amountIn), "TokenA transfer failed");
        require(tokenB.transfer(msg.sender, amountOut), "TokenB transfer failed");
        
        // 更新储备量
        _updateReserves(tokenA.balanceOf(address(this)), tokenB.balanceOf(address(this)));
        
        emit Swap(msg.sender, amountIn, amountOut, true);
        
        return amountOut;
    }

    /**
     * @dev 使用代币B交换代币A
     */
    function swapBForA(
        uint256 amountIn,
        uint256 minAmountOut
    ) external override returns (uint256 amountOut) {
        require(amountIn > 0, "Insufficient input amount");
        
        // 计算交换后得到的代币A数量
        amountOut = getAmountOut(amountIn, reserveB, reserveA);
        require(amountOut >= minAmountOut, "Insufficient output amount");
        
        // 转移代币
        require(tokenB.transferFrom(msg.sender, address(this), amountIn), "TokenB transfer failed");
        require(tokenA.transfer(msg.sender, amountOut), "TokenA transfer failed");
        
        // 更新储备量
        _updateReserves(tokenA.balanceOf(address(this)), tokenB.balanceOf(address(this)));
        
        emit Swap(msg.sender, amountIn, amountOut, false);
        
        return amountOut;
    }

    /**
     * @dev 计算两个数的平方根，用于计算流动性
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    /**
     * @dev 返回两个数的较小值
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
} 