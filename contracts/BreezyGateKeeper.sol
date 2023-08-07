// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

/*
 * For more details, visit the following links:
 * Website: https://breezy.finance
 * Twitter: https://twitter.com/BreezyFinance
 * Telegram: https://t.me/BreezyFinanceChannel
 * GitHub: https://github.com/breezyfinance
 */

contract BreezyGateKeeper is TimelockController {
    constructor(uint256 minDelay, address[] memory proposers, address[] memory executors, address admin) 
        TimelockController(minDelay, proposers, executors, admin) 
    {}
}
