// CustomERC20Mintable.sol

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomERC20Mintable is ERC20 {

    uint8 public tokenDecimals = 18;

    constructor(string memory name, string memory symbol, uint8 _tokenDecimals) ERC20(name, symbol) {
        tokenDecimals = _tokenDecimals;
    }

    function decimals() public view virtual override returns (uint8) {
        return tokenDecimals;
    }

    // Custom minting function, only accessible by the contract deployer
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
