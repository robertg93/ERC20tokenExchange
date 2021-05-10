// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";

contract TokenA is ERC20Mintable {
    constructor(uint256 initialSupply) public ERC20Mintable() {
        _mint(msg.sender, initialSupply);
    }
}