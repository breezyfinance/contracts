// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import './interfaces/IBreezyFarm.sol';
import './interfaces/IERC20withMint.sol';

contract BreezyMining is Ownable{

    using SafeMath for uint256;

    IERC20withMint public holdBRE;

    uint256 public totalBlockPerDay = 5760;// just use for dislay at UI
    // holdBRE each block.
    uint256 public holdbrePerBlock = 2*1e18; //2 BRE/block
    // The total point for all pools
    uint256 public totalAllocPoint = 1000;
    // The block when mining start
    uint256 public startBlock;

    PoolInfo[] public poolInfo;

    mapping(uint256 => mapping(address => uint256)) public rewardDebtOf;
    
    struct PoolInfo {
    	address want;                           // LP token Addess
        IBreezyFarm breezyFarm;                 // Address of Breezy Farm Contract.
        uint256 allocPoint;                
        uint256 lastRewardBlock;                // Last block number when the pool get reward.
        uint256 accHoldBREPerShare;             // Breezy Per Share of the pool.
    }

    event onHarvest(uint256 _pid, address _user, uint256 _amt);

    constructor(
        IERC20withMint _holdbre,
        uint256 _startBlock
    ) {
        holdBRE = _holdbre;
        startBlock = _startBlock;
    }

    function setHoldBREPerBlock(uint256 _holdbrePerBlock) public onlyOwner 
    {
        holdbrePerBlock = _holdbrePerBlock;
    }

    function setTotalBlockPerDay(uint256 _totalBlockPerDay) public onlyOwner 
    {
        totalBlockPerDay = _totalBlockPerDay;
    }

    function setTotalAllocPoint(uint256 _totalAllocPoint) public onlyOwner
    {
        totalAllocPoint = _totalAllocPoint;
    }

    function setBreezyTokenContract(address _holdBRE) public onlyOwner 
    {
        holdBRE = IERC20withMint(_holdBRE);
    }

    // Add a new pool. Can only be called by the owner.
    function addPool(uint256 _allocPoint, IBreezyFarm _holdbreFarm) public onlyOwner { 
    	address want = address(_holdbreFarm.want());
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        poolInfo.push(PoolInfo({
            want: want,
            breezyFarm: _holdbreFarm,
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accHoldBREPerShare: 0
        }));
    }

    //Update the given pool's allocation point. Can only be called by the owner.
    function setPoolPoint(uint256 _pid, uint256 allocPoint) public onlyOwner 
    {
    	updatePool(_pid);
        poolInfo[_pid].allocPoint = allocPoint;
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {

        PoolInfo storage pool = poolInfo[_pid];

        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 _totalShare = pool.breezyFarm.totalShare();
        
        uint256 _multiplier = getBlockFrom(pool.lastRewardBlock, block.number);

        uint256 _reward = _multiplier.mul(holdbrePerBlock).mul(pool.allocPoint).div(totalAllocPoint);

        if (_totalShare == 0) {

            pool.lastRewardBlock = block.number;

            return;
        }

        holdBRE.mint(address(this), _reward);

        pool.accHoldBREPerShare = pool.accHoldBREPerShare.add(_reward.mul(1e12).div(_totalShare));

        pool.lastRewardBlock = block.number;
    }

    function harvest(uint256 _pid, address _user) external returns(uint256 _pendingHoldBRE) 
    {	
    	updatePool(_pid);
    
    	uint256 _rewardDebt;
    	(_pendingHoldBRE, _rewardDebt, ) = getUserInfo(_pid, _user);

    	uint256 _holdbreBal = holdBRE.balanceOf(address(this));

    	rewardDebtOf[_pid][_user] = _rewardDebt;

        if (_pendingHoldBRE > _holdbreBal) {
            _pendingHoldBRE = _holdbreBal;
    	}
        if (_pendingHoldBRE > 0) {
            holdBRE.transfer(_user, _pendingHoldBRE);
            emit onHarvest(_pid, _user, _pendingHoldBRE);
        }
    }

    function updateUser(uint256 _pid, address _user) public returns(bool)
    {
        PoolInfo memory pool = poolInfo[_pid];
        require(address(pool.breezyFarm) == msg.sender, 'INVALID_PERMISSION');

        uint256 _userShare  = pool.breezyFarm.shareOf(_user);
        rewardDebtOf[_pid][_user] = _userShare.mul(pool.accHoldBREPerShare).div(1e12);

        return true;
    }


    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    function getBlockFrom(uint256 _from, uint256 _to) public pure returns (uint256) {
        return _to.sub(_from);
    }

    function getMiningSpeedOf(uint256 _pid) public view returns(uint256) {
        return poolInfo[_pid].allocPoint.mul(100).div(totalAllocPoint);
    }

    function getTotalMintPerDayOf(uint256 _pid) public view returns(uint256) {
        return totalBlockPerDay.mul(holdbrePerBlock).mul(poolInfo[_pid].allocPoint).div(totalAllocPoint);
    }

    function getHoldBREAddr() public view returns(address) {
        return address(holdBRE);
    }

    // View function to get User's Info in a pool.
    function getUserInfo(uint256 _pid, address _user) public view returns (uint256 _pendingHoldBRE, uint256 _rewardDebt, uint256 _userShare) { 

        PoolInfo memory pool = poolInfo[_pid];

        uint256 accHoldBREPerShare = pool.accHoldBREPerShare;

        // uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        uint256 _totalShare = pool.breezyFarm.totalShare();
        _userShare  = pool.breezyFarm.shareOf(_user);

        if (block.number > pool.lastRewardBlock && _totalShare != 0) {
            uint256 _multiplier = getBlockFrom(pool.lastRewardBlock, block.number);
            uint256 _reward = _multiplier.mul(holdbrePerBlock).mul(pool.allocPoint).div(totalAllocPoint);
            accHoldBREPerShare = accHoldBREPerShare.add(_reward.mul(1e12).div(_totalShare));
        }
        _rewardDebt  = _userShare.mul(accHoldBREPerShare).div(1e12);

        if (_rewardDebt > rewardDebtOf[_pid][_user]) {
            _pendingHoldBRE = _rewardDebt.sub(rewardDebtOf[_pid][_user]);
        }
    }
}