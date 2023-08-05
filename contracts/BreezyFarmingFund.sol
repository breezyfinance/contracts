// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
 * For more details, visit the following links:
 * Website: https://breezy.finance
 * Twitter: https://twitter.com/BreezyFinance
 * Telegram: https://t.me/BreezyFinanceChannel
 * GitHub: https://github.com/breezyfinance
 */

contract BreezyFarmingFund is Ownable {

    using SafeMath for uint256;

    uint256 public fundStartTime; // time when the contract is deployed

    modifier onlyAfterOneMonth {
        require(block.timestamp >= fundStartTime.add(30 days), "One month lock period is not over yet");
        _;
    }

    constructor() public {
        fundStartTime = block.timestamp;
    }

    function releaseFarmingFund(IERC20 token) public onlyOwner onlyAfterOneMonth {
        token.transfer(owner(), token.balanceOf(address(this)));
    }

}
