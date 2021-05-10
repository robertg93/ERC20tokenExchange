const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenA");
const Swap = artifacts.require("TokenSwap");


contract("Token Test", async accounts => {
    const [ initialHolder, User, depositAddress ] = accounts;

    beforeEach(async () => {
        this.tokenA = await TokenA.new(1000);
        this.tokenB = await TokenB.new(1000);
        this.swap = await Swap.new(this.tokenA.address, this.tokenB.address, 2)
        });


    it('Should transfer 100 token to User', async () => {
        const instance = this.tokenA;
        const value = 100;
        instance.transfer(User,value);
        const balance = await instance.balanceOf(User);
    
        assert.equal(balance.valueOf(), value, "Transfer to user failed");
    });

    it('Set allowance', async () => {
        const instance = this.tokenA;
        const value = 10;
        instance.approve(User,value);
        const allowance = await instance.allowance(initialHolder, User);
    
        assert.equal(allowance.valueOf(), value, "Setting allowance failed");
    });

    it('Test exchange A --> B', async () => {
        const instanceA = this.tokenA;
        const instanceB = this.tokenB;
        const instanceSwap = this.swap;
        const deposit = this.swap.address;
        const expectedValue = 400;

        await instanceA.mint(initialHolder,10000,{from: initialHolder});
        await instanceB.mint(initialHolder,10000,{from: initialHolder});

        await instanceA.approve(this.swap.address, 400,{from: initialHolder});
        await instanceB.approve(this.swap.address, 400,{from: initialHolder});

        
        await instanceSwap.deposit(this.tokenB.address,400,{from: initialHolder});
        await instanceA.transfer(User,1000,{from: initialHolder});
        await instanceSwap.updatePrice(4,{from: initialHolder})

        await instanceA.approve(deposit, 100,{from: User});
        await instanceSwap.exchange(this.tokenA.address,100,{from: User});

        const balance = await instanceB.balanceOf(User);
    
        assert.equal(balance.valueOf(), 400, "mint failed");
    });

    it('Test exchange B --> A', async () => {
        const instanceA = this.tokenA;
        const instanceB = this.tokenB;
        const instanceSwap = this.swap;
        const deposit = this.swap.address;
        const expectedValue = 50;

        await instanceA.mint(initialHolder,10000,{from: initialHolder});
        await instanceB.mint(initialHolder,10000,{from: initialHolder});

        await instanceA.approve(this.swap.address, 200,{from: initialHolder});
        await instanceB.approve(this.swap.address, 200,{from: initialHolder});

        
        await instanceSwap.deposit(this.tokenA.address,200,{from: initialHolder});
        await instanceB.transfer(User,1000,{from: initialHolder});

        await instanceB.approve(deposit, 100,{from: User});
        await instanceSwap.exchange(this.tokenB.address,100,{from: User});

        const balance = await instanceA.balanceOf(User);
    
        assert.equal(balance.valueOf(), expectedValue, "mint failed");
    });
});
