const BreezySwapper = artifacts.require("BreezySwapper");
const BreezySwapV1BREWETH = artifacts.require("BreezySwapV1BREWETH");
const BreezyWhitelist = artifacts.require("BreezyWhitelist");
const CustomERC20Mintable = artifacts.require("CustomERC20Mintable"); // Update with the actual token contract

contract("BreezySwapper", accounts => {

    let swapper, baseToken, tradeToken1, tradeToken2, pair1, pair2, whitelistContract;
    const baseDecimals = 18;
    const trade1Decimals = 18;
    const trade2Decimals = 18;

    beforeEach(async () => {
        // Deploy mock ERC20 tokens for both pairs
        baseToken = await CustomERC20Mintable.new("BaseToken", "BASE", baseDecimals);
        tradeToken1 = await CustomERC20Mintable.new("TradeToken1", "TRADE1", trade1Decimals);
        tradeToken2 = await CustomERC20Mintable.new("TradeToken2", "TRADE2", trade2Decimals);
        
        // Mint tokens for account 0
        const initialBalance = web3.utils.toBN('1000000').mul(web3.utils.toBN(10 ** baseDecimals));
        const initialTrade1Liquidity = web3.utils.toBN('1000000').mul(web3.utils.toBN(10 ** trade1Decimals)); // Scaled to tradeDecimals
        const initialTrade2Liquidity = web3.utils.toBN('1000000').mul(web3.utils.toBN(10 ** trade2Decimals)); // Scaled to tradeDecimals
        
        await baseToken.mint(accounts[0], initialBalance);
        await tradeToken1.mint(accounts[0], initialTrade1Liquidity);
        await tradeToken2.mint(accounts[0], initialTrade2Liquidity);
        
        // Deploy BreezySwapper contract
        swapper = await BreezySwapper.new();
        
        // Deploy two BreezySwapV1BREWETH pairs
        pair1 = await deployPair(baseToken, tradeToken1, accounts);
        pair2 = await deployPair(baseToken, tradeToken2, accounts);
        
        await swapper.approveWithPair(baseToken.address, pair1.address);
        await swapper.approveWithPair(baseToken.address, pair2.address);
        await swapper.approveWithPair(tradeToken1.address, pair1.address);
        await swapper.approveWithPair(tradeToken2.address, pair2.address);

    });

    // Helper function to deploy a pair
    async function deployPair(baseToken, tradeToken, accounts) {
        const lpAddress = accounts[1];
        const tradeDecimals = await tradeToken.decimals(); // Fetch the decimals for tradeToken

        const initialBaseLiquidity = web3.utils.toBN('100000000').mul(web3.utils.toBN(10 ** baseDecimals));
        const initialTradeLiquidity = web3.utils.toBN('100000000').mul(web3.utils.toBN(10 ** tradeDecimals));

        // Mint initial tokens to LP's address
        await baseToken.mint(lpAddress, initialBaseLiquidity);
        await tradeToken.mint(lpAddress, initialTradeLiquidity);
        
        const whitelistContract = await BreezyWhitelist.new();
        await whitelistContract.addAddress(swapper.address);

        // Define other parameters
        const feeMachineContract = accounts[2];
        const name = "BreezyTokenLP";
        const symbol = "BRZLP";

        // Deploy the BreezySwapV1BREWETH contract instance
        const pair = await BreezySwapV1BREWETH.new(
                baseToken.address,
                tradeToken.address,
                feeMachineContract,
                whitelistContract.address,
                name,
                symbol
        );

        // Approve the contract to spend LP's tokens
        await baseToken.approve(pair.address, initialBaseLiquidity, {from: lpAddress});
        await tradeToken.approve(pair.address, initialTradeLiquidity, {from: lpAddress});

        // Define parameters for adding liquidity
        const minLP = web3.utils.toWei('10000000', 'ether');
        const baseInputAmountForLP = web3.utils.toBN('10000000').mul(web3.utils.toBN(10 ** baseDecimals));
        const maxTokenInputAmountForLP = web3.utils.toBN('9000000').mul(web3.utils.toBN(10 ** tradeDecimals));
        const deadline = Math.floor(Date.now() / 1000) + 600;
        await pair.addLP(minLP, baseInputAmountForLP, maxTokenInputAmountForLP, deadline, {from: lpAddress});

        return pair;
    }
    
    it("should successfully swap tokens between two pairs", async () => {
        // Generate a random floating-point value between 1 and 1000000, with one decimal point
        const randomInput = (Math.random() * 999999 + 1).toFixed(trade1Decimals);
        // Convert the random floating-point value to the appropriate decimals
        const token1InputAmount = web3.utils.toBN(web3.utils.toWei(randomInput, 'ether')).div(web3.utils.toBN(10 ** (18 - trade1Decimals)));
        
        console.log("Random input amount (in trade1 decimals):", token1InputAmount.toString());
        
        const minToken2Output = await swapper.getTokenOutput(token1InputAmount, pair1.address, pair2.address);
        const deadline = (await web3.eth.getBlock('latest')).timestamp + 600;

        // Approve the swapper to spend caller's tokens
        await tradeToken1.approve(swapper.address, token1InputAmount, { from: accounts[0] });

        // Retrieve initial tradeToken2 balance
        const initialTradeToken2Balance = await tradeToken2.balanceOf(accounts[0]);

        // Perform the swap operation
        await swapper.swapTokenToTokenWithTokenInput(token1InputAmount, minToken2Output, pair1.address, pair2.address, deadline, { from: accounts[0] });

        // Retrieve the final tradeToken2 balance
        const finalTradeToken2Balance = await tradeToken2.balanceOf(accounts[0]);

        // Validate the results, e.g., the final tradeToken2 balance should be greater than or equal to the minimum acceptable output
        assert(finalTradeToken2Balance.sub(initialTradeToken2Balance).gte(minToken2Output), "Token2 output from swap is less than the minimum acceptable output");
    });
    it("should successfully call approveWithPair by owner", async function () {
        try {
            await swapper.approveWithPair(baseToken.address, pair1.address, { from: accounts[0] });
        } catch (error) {
            assert.fail("Function call by owner should not have failed");
        }
    });

    it("should revert when calling approveWithPair by non-owner", async function () {
        try {
          await swapper.approveWithPair(baseToken.address, pair1.address, { from: accounts[1] });
          assert.fail("Expected revert not received");
        } catch (error) {
          assert.include(error.message, "revert", "The error message should contain 'revert'");
        }
    });
    
});
