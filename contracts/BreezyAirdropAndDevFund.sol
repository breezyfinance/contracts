// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BreezyAirdropAndDevFund is Ownable {

    using SafeMath for uint256;

    uint256 public fundStartTime; // time when the contract is deployed

    modifier onlyAfterTwoMonths {
        require(block.timestamp >= fundStartTime.add(60 days), "Two month lock period is not over yet");
        _;
    }

    constructor() public {
        fundStartTime = block.timestamp;
    }

    function releaseAirdropAndDevFund(IERC20 token) public onlyOwner onlyAfterTwoMonths {
        token.transfer(owner(), token.balanceOf(address(this)));
    }

}
