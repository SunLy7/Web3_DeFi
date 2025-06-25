// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../interfaces/IERC20.sol";
import "../amm/SimpleAMM.sol";

/**
 * @title 流动性挖矿合约
 * @dev 用户质押LP代币获得奖励代币
 */
contract LiquidityMining {
    // 奖励代币
    IERC20 public immutable rewardToken;
    // LP代币(AMM流动性代币)
    IERC20 public immutable lpToken;
    
    // 每秒发放的奖励代币数量
    uint256 public rewardRate;
    // 最后更新时间
    uint256 public lastUpdateTime;
    // 每单位质押的累计奖励
    uint256 public rewardPerTokenStored;
    // 结束时间
    uint256 public periodFinish;
    // 奖励持续时间
    uint256 public rewardsDuration = 7 days;
    
    // 总质押量
    uint256 private _totalSupply;
    // 用户质押量
    mapping(address => uint256) private _balances;
    // 用户已结算的奖励
    mapping(address => uint256) private userRewardPerTokenPaid;
    // 用户待领取的奖励
    mapping(address => uint256) private rewards;
    
    // 合约部署者
    address public owner;
    
    // 事件定义
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event RewardAdded(uint256 reward);
    
    /**
     * @dev 构造函数
     * @param _rewardToken 奖励代币地址
     * @param _lpToken LP代币地址
     */
    constructor(address _rewardToken, address _lpToken) {
        require(_rewardToken != address(0), "Reward token cannot be zero address");
        require(_lpToken != address(0), "LP token cannot be zero address");
        
        rewardToken = IERC20(_rewardToken);
        lpToken = IERC20(_lpToken);
        owner = msg.sender;
    }
    
    // 修饰器：只有合约拥有者可调用
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    
    // 修饰器：更新奖励
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    /**
     * @dev 获取当前适用于奖励计算的最后时间
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }
    
    /**
     * @dev 计算每个质押代币的奖励
     */
    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        
        return rewardPerTokenStored + (
            (lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18 / _totalSupply
        );
    }
    
    /**
     * @dev 计算用户已赚取的奖励
     */
    function earned(address account) public view returns (uint256) {
        return (
            _balances[account] * 
            (rewardPerToken() - userRewardPerTokenPaid[account]) / 
            1e18
        ) + rewards[account];
    }
    
    /**
     * @dev 获取总质押量
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
    
    /**
     * @dev 获取用户质押量
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @dev 质押LP代币
     */
    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        
        // 转移LP代币到合约
        require(lpToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // 更新质押量
        _totalSupply += amount;
        _balances[msg.sender] += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev 提取质押的LP代币
     */
    function withdraw(uint256 amount) public updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(_balances[msg.sender] >= amount, "Insufficient staked amount");
        
        // 更新质押量
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        
        // 转移LP代币给用户
        require(lpToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }
    
    /**
     * @dev 领取奖励
     */
    function getReward() public updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(rewardToken.transfer(msg.sender, reward), "Transfer failed");
            emit RewardPaid(msg.sender, reward);
        }
    }
    
    /**
     * @dev 退出：提取所有质押并领取奖励
     */
    function exit() external {
        withdraw(_balances[msg.sender]);
        getReward();
    }
    
    /**
     * @dev 通知奖励金额，开始新的奖励发放周期
     * @param reward 要发放的奖励代币数量
     */
    function notifyRewardAmount(uint256 reward) external onlyOwner updateReward(address(0)) {
        // 如果是新周期，直接设置奖励率
        if (block.timestamp >= periodFinish) {
            rewardRate = reward / rewardsDuration;
        }
        // 如果是增加现有周期的奖励，重新计算奖励率
        else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            rewardRate = (reward + leftover) / rewardsDuration;
        }
        
        // 确保合约中有足够的奖励代币
        uint balance = rewardToken.balanceOf(address(this));
        require(rewardRate <= balance / rewardsDuration, "Provided reward too high");
        
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + rewardsDuration;
        
        emit RewardAdded(reward);
    }
    
    /**
     * @dev 更新奖励持续时间
     */
    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(block.timestamp > periodFinish, "Previous rewards period must be complete");
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(_rewardsDuration);
    }
} 