// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import './interfaces/IBreezyMining.sol';

contract BreezyFarm is ReentrancyGuard, Ownable {

    using SafeMath for uint256;
    
    IERC20 public want; // LP

    IBreezyMining public miningMachine;

    uint256 public pidOfMining;
    uint256 public totalShare = 0;
    mapping(address => uint256) public shareOf;

    event onDeposit(address _user, uint256 _amount);
    event onWithdraw(address _user, uint256 _amount);
    event onEmergencyWithdraw(address _user, uint256 _amount);

    constructor(
        IBreezyMining _miningMachine,
        IERC20 _want,
        uint256 _pidOfMining
        ) {
        want = _want;
        miningMachine = _miningMachine;
        pidOfMining = _pidOfMining;
    }

    function setMiningMachine(address _miningMachine) public onlyOwner 
    {
        miningMachine = IBreezyMining(_miningMachine);
    }

    function changeWantAddress(address _want) public onlyOwner
    {
        want = IERC20(_want); 
    }

    function setPidOfMining(uint256 _pidOfMining) public onlyOwner 
    {
        pidOfMining = _pidOfMining;
    }

    function deposit(uint256 _wantAmt) external nonReentrant 
    {
        require(_wantAmt > 0, 'INVALID_INPUT');

        uint256 userBalance = want.balanceOf(msg.sender);
        if(_wantAmt > userBalance) {
            _wantAmt = userBalance;
        }

        harvest(msg.sender);
    	want.transferFrom(msg.sender, address(this), _wantAmt);
        shareOf[msg.sender] = shareOf[msg.sender].add(_wantAmt);
        totalShare = totalShare.add(_wantAmt);
        miningMachine.updateUser(pidOfMining, msg.sender);
        emit onDeposit(msg.sender, _wantAmt);
    }

    function withdraw(uint256 _wantAmt) external nonReentrant 
    {
        require(_wantAmt > 0, 'INVALID_INPUT');   
        harvest(msg.sender);

        uint256 _share = shareOf[msg.sender];
        if(_wantAmt > _share) {
            _wantAmt = _share;
        }

        shareOf[msg.sender] = shareOf[msg.sender].sub(_wantAmt);
        totalShare = totalShare.sub(_wantAmt);
        uint256 _wantBal = want.balanceOf(address(this)); 
        if (_wantBal < _wantAmt) {
            _wantAmt = _wantBal;
        }
        want.transfer(msg.sender, _wantAmt);
        
        miningMachine.updateUser(pidOfMining, msg.sender);
    	// 
        emit onWithdraw(msg.sender, _wantAmt);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw() public 
    {
        uint256 _share = shareOf[msg.sender];
        require(_share > 0, 'INVALID_AMOUNT');

        shareOf[msg.sender] = 0;
        totalShare = totalShare.sub(_share);
        uint256 _wantBal = want.balanceOf(address(this));
        if (_wantBal < _share) {
            _share = _wantBal;
        }

        want.transfer(msg.sender, _share);

        emit onEmergencyWithdraw(msg.sender, _share);
    }

    function harvest(address _user) public returns(uint256 _pendingHoldBRE) { 
        return miningMachine.harvest(pidOfMining, _user);
    }

    function getData(
        address _user
    ) 
    public 
    view
    returns(
        uint256 miningSpeed_,
        uint256 userWantBal_, 
        uint256 totalMintPerDay_, 
        uint256 userETHBal_, 
        uint256 userBREPending_, 
        uint256 userWantShare_,
        uint256 tvl_
    ) {
        userWantBal_ = want.balanceOf(_user);
        totalMintPerDay_ = miningMachine.getTotalMintPerDayOf(pidOfMining);

        miningSpeed_ = miningMachine.getMiningSpeedOf(pidOfMining);
        userETHBal_ = address(_user).balance;
        (userBREPending_, , ) = miningMachine.getUserInfo(pidOfMining, _user);
        userWantShare_ = shareOf[_user];
        tvl_ = totalShare;
    } 
}