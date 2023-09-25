// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract test {
    function deposit(IERC20 _XBOTAddress, address _fromAddress, address _toAddress, uint256 _amount) public {
        _XBOTAddress.transferFrom(_fromAddress, _toAddress, _amount);
    }
}