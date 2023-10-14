// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IXBOT {
    function buyPrice() external view returns (uint256);
    function sellPrice() external view returns (uint256);
    function balanceOf(address user) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function getETHBalance() external view returns (uint256);
    function myDividends(bool _includeReferralBonus, address _customerAddress) external view returns (uint256);
}

contract XBOTData is Ownable{

    IXBOT public XBOTContract;

    constructor(IXBOT xbotContractAddress) {
        XBOTContract = xbotContractAddress;
    }

    function setXbotContract(IXBOT xbotContractAddress) public onlyOwner {
        XBOTContract = xbotContractAddress;
    }

    function getData(bool includeReferralBonus, address user) public view returns (
        uint256 buyPrice,
        uint256 sellPrice,
        uint256 balanceUser,
        uint256 totalSupply,
        uint256 ethBalanceUser,
        uint256 myDividends
    ) {
        buyPrice = XBOTContract.buyPrice();
        sellPrice = XBOTContract.sellPrice();
        balanceUser = XBOTContract.balanceOf(user);
        totalSupply = XBOTContract.totalSupply();
        ethBalanceUser = user.balance;
        myDividends = XBOTContract.myDividends(includeReferralBonus, user);
    }
}