// CustomERC20Mintable.sol

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomERC20Mintable is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    // Custom minting function, only accessible by the contract deployer
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
