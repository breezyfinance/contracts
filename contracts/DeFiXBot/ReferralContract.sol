// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReferralContract {
    
    mapping(address => bytes32) private userToRefCode;
    mapping(bytes32 => address) private refCodeToUser;

    function setReferralCode(bytes32 _refCode) external {
        require(userToRefCode[msg.sender] == 0, "Referral code already set");
        require(refCodeToUser[_refCode] == address(0), "Referral code already in use");

        userToRefCode[msg.sender] = _refCode;
        refCodeToUser[_refCode] = msg.sender;
    }

    function getReferralCodeByUser(address _user) external view returns (bytes32) {
        return userToRefCode[_user];
    }

    function getUserByReferralCode(bytes32 _refCode) public view returns(address) {
        return refCodeToUser[_refCode];
    }
}