// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
 * For more details, visit the following links:
 * Website: https://breezy.finance
 * Twitter: https://twitter.com/BreezyFinance
 * Telegram: https://t.me/BreezyFinanceChannel
 * GitHub: https://github.com/breezyfinance
 */

contract BRE is ERC20Burnable, Ownable {
    using SafeMath for uint256;

    uint256 public immutable MAX_SUPPLY;

    uint256 public totalBurned = 0;

    // Wallet holding limit mechanism
    uint256 public maxWalletToken;
    mapping(address => bool) public _isExcludedFromMaxWallet;

    constructor(
        uint256 _maxSupply,
        uint256 _initialSupply
    ) ERC20("BreezyFinance", "BRE") {
        require(_initialSupply <= _maxSupply, "BRE: The _initialSupply should not exceed the _maxSupply");
        MAX_SUPPLY = _maxSupply;

        maxWalletToken = _maxSupply.mul(5).div(100);  // 5% of max supply

        // Exclude owner and this contract from max wallet limit
        _isExcludedFromMaxWallet[msg.sender] = true;
        _isExcludedFromMaxWallet[address(this)] = true;

        if (_initialSupply > 0) {
            _mint(_msgSender(), _initialSupply);
        }
    }

    function _burn(address account, uint256 amount) internal override {
        super._burn(account, amount);
        totalBurned = totalBurned.add(amount);
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(
            _isExcludedFromMaxWallet[recipient] || balanceOf(recipient).add(amount) <= maxWalletToken,
            "BRE: Exceeds maximum wallet token amount."
        );
        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(
            _isExcludedFromMaxWallet[recipient] || balanceOf(recipient).add(amount) <= maxWalletToken,
            "BRE: Exceeds maximum wallet token amount."
        );
        return super.transferFrom(sender, recipient, amount);
    }

    function excludeFromMaxWallet(address account) public onlyOwner {
        require(account != address(0), "BRE: Zero address is not allowed.");
        _isExcludedFromMaxWallet[account] = true;
    }

    function includeInMaxWallet(address account) public onlyOwner {
        require(account != address(0), "BRE: Zero address is not allowed.");
        _isExcludedFromMaxWallet[account] = false;
    }

    function setMaxWalletPercent(uint8 percent) public onlyOwner {
        require(percent >= 5, "BRE: Cannot set maxWalletToken below 5%");
        maxWalletToken = MAX_SUPPLY.mul(percent).div(100);
    }
}
