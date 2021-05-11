// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "./Ownable.sol";

contract TokenSwap is Ownable{
    IERC20 public tokenA;
    IERC20 public tokenB;
    uint public price;

    constructor(
        address _tokenA,
        address _tokenB,
        uint _price
    ) public Ownable(){
        tokenA = ERC20Mintable(_tokenA);
        tokenB = ERC20Mintable(_tokenB);
        price = _price;
    }

    function updatePrice(uint newPrice) onlyOwner() public {
        require(newPrice != 0,"Contract balance is to low");
        price = newPrice;
    }

    // deposit token A or B on TokenSwap contract
    function deposit(address token, uint256 amount) onlyOwner() external {
        require(token == address(tokenA) || token == address(tokenB) , "Wrong token address");
        if(token == address(tokenA)) tokenA.transferFrom(msg.sender, address(this), amount);
        else tokenB.transferFrom(msg.sender, address(this), amount);
    }

    // exchange tokens A <--> B at the token rate price 
    function exchange(address token, uint Amount ) public {
        require(token == address(tokenA) || token == address(tokenB) , "Wrong token address");

        if(token == address(tokenA)){
            uint balance = tokenB.balanceOf(address(this));
            require(balance >= (Amount * price),"Contract balance is to low");
            uint userBalance = tokenA.balanceOf(msg.sender);
            require(userBalance >= Amount,"User balance is to low");
            tokenA.transferFrom( msg.sender, address(this), Amount);
            tokenB.transfer(msg.sender, Amount*price);
        }
        else{
            uint balance = tokenA.balanceOf(address(this));
            require(balance >= (Amount / price),"Contract balance is to low");
            uint userBalance = tokenB.balanceOf(msg.sender);
            require(userBalance >= Amount,"User balance is to low");
            tokenB.transferFrom( msg.sender, address(this), Amount);
            tokenA.transfer(msg.sender, Amount/price);
        }
    }
}