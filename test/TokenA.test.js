const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");
const Swap = artifacts.require("TokenSwap");

var chai = require("chai");

const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);
chai.use(chaiBN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const expect = chai.expect;


contract('Test exchange A --> B', async accounts => {
    const [ initialHolder, User, depositAddress ] = accounts;
    let tokenA
    let tokenB
    let tokenSwap
    let deposit
    const price = 10;
    const exchangeAmount = 200;
    const expectedValue = exchangeAmount*price;
    const transferToUser = 10000;                        //should be higher than exchange amount
    const depositAmount = 10000;                         //should be higher than expected value
    const mintAmount = 100000;                           //should be higher than depositAmount and transferToUser
    
    

    before('setup contracts', async () => {
        tokenA = await TokenA.new(0, {from: initialHolder});
        tokenB = await TokenB.new(0, {from: initialHolder});
        tokenSwap = await Swap.new(tokenA.address, tokenB.address, 2, {from: initialHolder})
        deposit = tokenSwap.address;
        });

    it('Test mint on token A', async () => {
        await tokenA.mint(initialHolder, mintAmount, {from: initialHolder});
        let totalSupply = await tokenA.totalSupply();
    
    expect(tokenA.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply);
    });

    it('Test mint on token B', async () => {
        await tokenB.mint(initialHolder, mintAmount, {from: initialHolder});
        let totalSupply = await tokenB.totalSupply();
    
    expect(tokenB.balanceOf(initialHolder)).to.eventually.be.a.bignumber.equal(totalSupply);
    });

    it('Test allowance token A --> swapContract', async () => {
        const transferAmount = new BN(depositAmount)
        await tokenA.approve(deposit, depositAmount, {from: initialHolder});
    
    expect(tokenA.allowance(initialHolder,deposit)).to.eventually.be.a.bignumber.equal(transferAmount);
    });

    it('Test allowance token B --> swapContract', async () => {
        const transferAmount = new BN(depositAmount)
        await tokenB.approve(deposit, depositAmount, {from: initialHolder});
    
    expect(tokenB.allowance(initialHolder,deposit)).to.eventually.be.a.bignumber.equal(transferAmount);
    });

    it('Test ballance of swapContract', async () => {
        const transferAmount = new BN(depositAmount)
        await tokenSwap.deposit(tokenB.address,depositAmount, {from: initialHolder});
    
    expect(tokenB.balanceOf(deposit)).to.eventually.be.a.bignumber.equal(transferAmount);
    });

    it('Test transfer from initialHolder to User', async () => {
        const transferAmount = new BN(transferToUser)
        await tokenA.transfer(User, transferToUser, {from: initialHolder});
    
    expect(tokenA.balanceOf(User)).to.eventually.be.a.bignumber.equal(transferAmount);
    });

    it('Test if after all operations User will receive expected amount of token', async () => {
        //set price
        await tokenSwap.updatePrice(price, {from: initialHolder});
        //set allowance User --> deposit
        await tokenA.approve(deposit, exchangeAmount, {from: User});
        // User changes token A --> token B
        await tokenSwap.exchange(tokenA.address,exchangeAmount, {from: User});
        const balance = await tokenB.balanceOf(User);
    
        assert.equal(balance.valueOf(), expectedValue, "User balance is incorrect");
    });
});


contract("Test exchange B --> A", async accounts => {
    const [ initialHolder, User, depositAddress ] = accounts;
    let tokenA
    let tokenB
    let tokenSwap

    before('setup contracts', async () => {
        tokenA = await TokenA.new(0, {from: initialHolder});
        tokenB = await TokenB.new(0, {from: initialHolder});
        tokenSwap = await Swap.new(tokenA.address, tokenB.address, 2, {from: initialHolder})
        });

    it('Test exchange B --> A', async () => {
        const deposit = tokenSwap.address;
        const price = 4;
        const exchangeAmount = 200;
        const expectedValue = exchangeAmount*price;
        const transferToUser = 10000;                        //should be higher than exchange amount
        const depositAmount = 10000;                         //should be higher than expected value
        const mintAmount = 100000;                           //should be higher than depositAmount and transferToUser

        //set price 
        await tokenSwap.updatePrice(price, {from: initialHolder});
        //mint token A
        await tokenA.mint(initialHolder,mintAmount, {from: initialHolder});
        //mint token B
        await tokenB.mint(initialHolder,mintAmount, {from: initialHolder});
        //set allowance tokenA --> deposit
        await tokenA.approve(deposit, depositAmount, {from: initialHolder});
        //send token A to deposit 
        await tokenSwap.deposit(tokenA.address,depositAmount, {from: initialHolder});
        //transfer some amount of tokens to User
        await tokenB.transfer(User, transferToUser, {from: initialHolder});
        //set allowance User --> deposit
        await tokenB.approve(deposit, exchangeAmount,{from: User});
        // User changes token B --> token A
        await tokenSwap.exchange(tokenB.address,exchangeAmount, {from: User});

        expect(tokenA.balanceOf(User)).to.eventually.be.a.bignumber.equal(expectedValue);
    });
});
