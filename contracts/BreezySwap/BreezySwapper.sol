// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import './interfaces/IBreezySwapV1BREWETH.sol';

contract BreezySwapper is Ownable {
    constructor() public {}

    function getTokenOutput(uint256 token1InputAmount, IBreezySwapV1BREWETH token1Pair, IBreezySwapV1BREWETH token2Pair) public view returns (uint256) {
        //get token1 to base
        uint256 baseAmount = token1Pair.getBaseOutput(token1InputAmount);
        //get base to token2
        uint256 token2OutputAmount = token2Pair.getTokenOutput(baseAmount);
        return token2OutputAmount;
    }

    function approveWithPair(IERC20 token, IBreezySwapV1BREWETH pair) public onlyOwner {
        token.approve(address(pair), 115792089237316195423570985008687907853269984665640564039457584007913129639935);
    }

    function swapTokenToTokenWithTokenInput(
        uint256 token1InputAmount, 
        uint256 minToken2Output, 
        address token1PairAddress, 
        address token2PairAddress, 
        uint256 deadline
    ) public {
        require(token1PairAddress != token2PairAddress, 'SAME_PAIR');

        IBreezySwapV1BREWETH token1Pair = IBreezySwapV1BREWETH(token1PairAddress);
        IBreezySwapV1BREWETH token2Pair = IBreezySwapV1BREWETH(token2PairAddress);

        IERC20 token1 = IERC20(token1Pair.token());
        IERC20 token2 = IERC20(token2Pair.token());

        // Get token1 to base
        uint256 baseAmount = token1Pair.getBaseOutput(token1InputAmount);

        // Get base to token2
        uint256 token2OutputAmount = token2Pair.getTokenOutput(baseAmount);
        require(token2OutputAmount >= minToken2Output, 'CAN_NOT_MAKE_TRADE');

        // Make trade token1 to base
        token1.transferFrom(msg.sender, address(this), token1InputAmount);
        token1Pair.swapTokenToBaseWithTokenInput(token1InputAmount, baseAmount, deadline);

        // Make trade base to token2
        token2Pair.swapBaseToTokenWithBaseInput(baseAmount, token2OutputAmount, deadline);
        token2.transfer(msg.sender, token2OutputAmount);
    }
}
