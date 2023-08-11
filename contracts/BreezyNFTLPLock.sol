// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/*
 * For more details, visit the following links:
 * Website: https://breezy.finance
 * Twitter: https://twitter.com/BreezyFinance
 * Telegram: https://t.me/BreezyFinanceChannel
 * GitHub: https://github.com/breezyfinance
 */

contract BreezyNFTLPLock is Ownable, IERC721Receiver {
    
    using SafeMath for uint256;

    uint256 public fundStartTime; // time when the contract is deployed

    modifier onlyAfterOneMonth {
        require(block.timestamp >= fundStartTime.add(30 days), "One month lock period is not over yet");
        _;
    }

    constructor() {
        fundStartTime = block.timestamp;
    }

    // ERC721Receiver implementation
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // Release the NFT
    function releaseNFT(IERC721 nft, uint256 tokenId) external onlyOwner onlyAfterOneMonth {
        require(nft.ownerOf(tokenId) == address(this), "Contract does not own this NFT");

        // Transfer the NFT back to the owner
        nft.safeTransferFrom(address(this), owner(), tokenId);
    }
}