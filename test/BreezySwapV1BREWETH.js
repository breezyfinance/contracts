const BreezySwapV1BREWETH = artifacts.require("BreezySwapV1BREWETH");
const BreezyWhitelist = artifacts.require("BreezyWhitelist");
const CustomERC20Mintable  = artifacts.require("CustomERC20Mintable");

contract("BreezySwapV1BREWETH", (accounts) => {
    let contractInstance;
    let baseToken;
    let tradeToken;
    const baseDecimals = 8;
    const tradeDecimals = 6;

    beforeEach(async () => {
      // Deploy mock ERC20 tokens
      baseToken = await CustomERC20Mintable .new("BaseToken", "BASE", baseDecimals);
      tradeToken = await CustomERC20Mintable .new("TradeToken", "TRADE", tradeDecimals);

      // Define LP's address and initial amounts for liquidity
      const lpAddress = accounts[1];
      const initialBaseLiquidity = web3.utils.toBN('10000000000000000000000000000000000000000000000000000000000').mul(web3.utils.toBN(10**baseDecimals)); // Scaled to baseDecimals
      const initialTradeLiquidity = web3.utils.toBN('10000000000000000000000000000000000000000000000000000000000').mul(web3.utils.toBN(10**tradeDecimals)); // Scaled to tradeDecimals

      // Mint initial tokens to LP's address
      await baseToken.mint(lpAddress, initialBaseLiquidity);
      await tradeToken.mint(lpAddress, initialTradeLiquidity);
      await baseToken.mint(accounts[0], initialBaseLiquidity);
      await tradeToken.mint(accounts[0], initialTradeLiquidity);

      // ... rest of the setup code
        // Deploy the BreezyWhitelist contract
      whitelistContract = await BreezyWhitelist.new();

      // Define other parameters
      const feeMachineContract = accounts[2]; // Address or instance of the fee machine contract
      const name = "BreezyTokenLP"; // Example name
      const symbol = "BRZLP"; // Example symbol

      // Deploy the BreezySwapV1BREWETH contract instance
      contractInstance = await BreezySwapV1BREWETH.new(
          baseToken.address, 
          tradeToken.address, 
          feeMachineContract, 
          whitelistContract.address,
          name,
          symbol
      );

      // Approve the contract to spend LP's tokens
      await baseToken.approve(contractInstance.address, initialBaseLiquidity, { from: lpAddress });
      await tradeToken.approve(contractInstance.address, initialTradeLiquidity, { from: lpAddress });

      // Define parameters for adding liquidity
      const minLP = web3.utils.toWei('10', 'ether');
      const baseInputAmountForLP = web3.utils.toBN('10').mul(web3.utils.toBN(10**baseDecimals)); // Scaled to baseDecimals
      const maxTokenInputAmountForLP = web3.utils.toBN('10').mul(web3.utils.toBN(10**tradeDecimals)); // Scaled to tradeDecimals
      const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
      // Call the addLP function to add liquidity
      await contractInstance.addLP(minLP, baseInputAmountForLP, maxTokenInputAmountForLP, deadline, { from: lpAddress });
    });

//    it("should correctly calculate token output from base input", async () => {
//      // Define the base input amount (scaled to baseDecimals)
//      const baseInputAmount = web3.utils.toBN('1').mul(web3.utils.toBN(10**baseDecimals));
//
//      // Retrieve the base and token reserves
//      const reserves = await contractInstance.getTotalReserve();
//      const baseReserve = reserves['0'].mul(web3.utils.toBN(10**(18 - baseDecimals)));
//      const tokenReserve = reserves['1'].mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//      // Calculate the trade fee and subtract it from the base input
//      const TRADE_FEE = await contractInstance.TRADE_FEE();
//      const tradeFee =  new web3.utils.BN(baseInputAmount).mul(TRADE_FEE).div(new web3.utils.BN(1000));
//      const baseInputAmountAfterFee = baseInputAmount.sub(tradeFee).mul(web3.utils.toBN(10**(18 - baseDecimals)));
//
//      // Apply the x * y = k formula to calculate the expected token output
//      const k = new web3.utils.BN(baseReserve).mul(new web3.utils.BN(tokenReserve));
//      const expectedTokenOutputIn18Decimals = new web3.utils.BN(tokenReserve).sub(k.div(new web3.utils.BN(baseReserve).add(baseInputAmountAfterFee)));
//
//      // Scale the expected token output according to the trade token's decimals
//      const expectedTokenOutput = expectedTokenOutputIn18Decimals.div(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//      // Call the function to calculate the token output
//      const calculatedTokenOutput = await contractInstance.getTokenOutput(baseInputAmount);
//
//
//      // Assert that the calculated token output is correct
//      assert.equal(calculatedTokenOutput.toString(), expectedTokenOutput.toString(), "Calculated token output is incorrect");
//    });
//
//    it("should correctly calculate LP tokens when adding liquidity", async () => {
//      // Define the amounts of base and trade tokens to add as liquidity (scaled to respective decimals)
//        const baseLiquidityAmount = web3.utils.toBN('1').mul(web3.utils.toBN(10**baseDecimals));
//        const tradeLiquidityAmount = web3.utils.toBN('1').mul(web3.utils.toBN(10**tradeDecimals));
//
//      // Approve the contract to spend LP's tokens
//      const lpAddress = accounts[1];
//
//      // Retrieve the total supply of LP tokens before adding liquidity
//      const totalSupplyBefore = await contractInstance.totalSupply();
//
//      // Retrieve the base and token reserves
//      const reserves = await contractInstance.getTotalReserve();
//      const baseReserve = reserves['0'].mul(web3.utils.toBN(10**(18 - baseDecimals)));
//      const tokenReserve = reserves['1'].mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//      // Add liquidity
//      const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
//      await contractInstance.addLP(1, baseLiquidityAmount, tradeLiquidityAmount, deadline, { from: lpAddress });
//
//      // Retrieve the total supply of LP tokens after adding liquidity
//      const totalSupplyAfter = await contractInstance.totalSupply();
//
//      // Calculate expected LP tokens (using 18 decimals)
//      const expectedLPAmount = baseLiquidityAmount.mul(web3.utils.toBN(10**(18 - baseDecimals))).mul(totalSupplyBefore).div(baseReserve);
//
//      // Assert that the total supply of LP tokens increased by the expected amount
//      assert.equal(totalSupplyAfter.sub(totalSupplyBefore).toString(), expectedLPAmount.toString(), "LP tokens calculation is incorrect");
//    });
//    it("should maintain the reserve ratio when adding liquidity", async () => {
//        // Generate a random floating-point value between 1 and 20, with one decimal point
//        const randomBaseInput = (Math.random() * 999 + 1).toFixed(baseDecimals);
//
//        // Convert the random floating-point value to the appropriate base decimals
//        const baseInputAmountInBaseDecimals = web3.utils.toBN(web3.utils.toWei(randomBaseInput, 'ether')).div(web3.utils.toBN(10**(18 - baseDecimals)));
//        
//        console.log("Random base input amount (in base decimals):", baseInputAmountInBaseDecimals.toString());
//
//        const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future
//        
//        // Get the mintLP and maxTokenInputAmount using the provided function
//        const dataAddLP = await contractInstance.getDataFromBaseInputToAddLp(baseInputAmountInBaseDecimals);
//        let minLP = dataAddLP[0];
//        let maxTokenInputAmountInTradeDecimals = dataAddLP[1];
//
//        // Convert baseInputAmount to 18 decimals
//        const baseInputAmount = baseInputAmountInBaseDecimals.mul(web3.utils.toBN(10**(18 - baseDecimals)));
//
//        // Retrieve the initial reserves and convert to 18 decimals
//        const initialReserves = await contractInstance.getTotalReserve();
//        const initialBaseReserve = web3.utils.toBN(initialReserves['0']).mul(web3.utils.toBN(10**(18 - baseDecimals)));
//        const initialTokenReserve = web3.utils.toBN(initialReserves['1']).mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//        // Approve the contract to spend caller's tokens
//        await baseToken.approve(contractInstance.address, baseInputAmountInBaseDecimals, { from: accounts[0] });
//        await tradeToken.approve(contractInstance.address, maxTokenInputAmountInTradeDecimals, { from: accounts[0] });
//
//        // Add liquidity
//        await contractInstance.addLP(minLP, baseInputAmountInBaseDecimals, maxTokenInputAmountInTradeDecimals, deadline, { from: accounts[0] });
//
//        // Retrieve the final reserves
//        const finalReserves = await contractInstance.getTotalReserve();
//        const finalBaseReserve = web3.utils.toBN(finalReserves['0']).mul(web3.utils.toBN(10**(18 - baseDecimals)));
//        const finalTokenReserve = web3.utils.toBN(finalReserves['1']).mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//        // Verify that the ratio of the reserves remains the same
//        const initialRatio = initialBaseReserve.div(initialTokenReserve);
//        const finalRatio = finalBaseReserve.div(finalTokenReserve);
//        assert.equal(initialRatio.toString(), finalRatio.toString(), "Reserve ratio did not remain the same after adding liquidity");
//    });
//    
//    it("should maintain the reserve ratio when removing liquidity", async () => {
//        // Generate a random floating-point value between 1 and 1000, with one decimal point
//        const randomBaseInput = (Math.random() * 999 + 1).toFixed(baseDecimals);
//
//        // Convert the random floating-point value to the appropriate decimals
//        const baseInputAmountInBaseDecimals = web3.utils.toBN(web3.utils.toWei(randomBaseInput, 'ether')).div(web3.utils.toBN(10**(18 - baseDecimals)));
//
//        console.log("Random base input amount (in base decimals):", baseInputAmountInBaseDecimals.toString());
//
//
//        const deadline = (await web3.eth.getBlock('latest')).timestamp + 600;
//
//        // Get the mintLP and maxTokenInputAmount using the provided function
//        const dataAddLP = await contractInstance.getDataFromBaseInputToAddLp(baseInputAmountInBaseDecimals);
//        let mintLP = dataAddLP[0];
//        let maxTokenInputAmountInTradeDecimals = dataAddLP[1];
//
//        // Approve the contract to spend caller's tokens
//        await baseToken.approve(contractInstance.address, baseInputAmountInBaseDecimals, { from: accounts[0] });
//        await tradeToken.approve(contractInstance.address, maxTokenInputAmountInTradeDecimals, { from: accounts[0] });
//
//        // Add liquidity
//        await contractInstance.addLP(mintLP, baseInputAmountInBaseDecimals, maxTokenInputAmountInTradeDecimals, deadline, { from: accounts[0] });
//
//        // Retrieve LP tokens
//        const lpTokensToRemove = await contractInstance.balanceOf(accounts[0]);
//
//        // Call your function to get the minimum acceptable base and token outputs (if you have one)
//        const dataRemoveLP = await contractInstance.getDataToRemoveLP(lpTokensToRemove);
//        let minBaseOutput = dataRemoveLP[0];
//        let minTokenOutput = dataRemoveLP[1];
//        
//        // Retrieve the initial reserves and convert to 18 decimals
//        const initialReserves = await contractInstance.getTotalReserve();
//        const initialBaseReserve = web3.utils.toBN(initialReserves['0']).mul(web3.utils.toBN(10**(18 - baseDecimals)));
//        const initialTokenReserve = web3.utils.toBN(initialReserves['1']).mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//        
//        // Remove liquidity
//        await contractInstance.removeLP(lpTokensToRemove, minBaseOutput, minTokenOutput, deadline, { from: accounts[0] });
//
//        // Retrieve the final reserves and convert to 18 decimals
//        const finalReserves = await contractInstance.getTotalReserve();
//        const finalBaseReserve = web3.utils.toBN(finalReserves['0']).mul(web3.utils.toBN(10**(18 - baseDecimals)));
//        const finalTokenReserve = web3.utils.toBN(finalReserves['1']).mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//        // Verify that the ratio of the reserves remains the same
//        const initialRatio = initialBaseReserve.div(initialTokenReserve);
//        const finalRatio = finalBaseReserve.div(finalTokenReserve);
//        
//        assert.equal(initialRatio.toString(), finalRatio.toString(), "Reserve ratio did not remain the same after removing liquidity");
//    });
//
//
//
//    it("should correctly handle swapBaseToTokenWithBaseInput", async () => {
//        // Generate a random floating-point value between 1 and 1000, with base decimal point
//        const randomBaseInput = (Math.random() * 999 + 1).toFixed(baseDecimals);
//
//        // Convert the random floating-point value to the appropriate base decimals
//        const baseInputAmount = web3.utils.toBN(web3.utils.toWei(randomBaseInput, 'ether')).div(web3.utils.toBN(10**(18 - baseDecimals)));
//        
//        console.log("Random base input amount (in base decimals):", baseInputAmount.toString());
//
//        // Retrieve the initial reserves and scale them to 18 decimals
//        const initialReserves = await contractInstance.getTotalReserve();
//        const initialBaseReserve = initialReserves['0'].mul(web3.utils.toBN(10**(18 - baseDecimals)));
//        const initialTokenReserve = initialReserves['1'].mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//        // Calculate the trade fee and subtract it from the base input (scaled to 18 decimals)
//        const TRADE_FEE = await contractInstance.TRADE_FEE();
//        const tradeFee = baseInputAmount.mul(TRADE_FEE).div(new web3.utils.BN(1000)).mul(web3.utils.toBN(10**(18 - baseDecimals)));
//        const baseInputAmountAfterFee = baseInputAmount.mul(web3.utils.toBN(10**(18 - baseDecimals))).sub(tradeFee);
//
//        // Apply the x * y = k formula to calculate the expected token output (scaled to 18 decimals)
//        const k = initialBaseReserve.mul(initialTokenReserve);
//        let expectedTokenOutput = initialTokenReserve.sub(k.div(initialBaseReserve.add(baseInputAmountAfterFee)));
//        expectedTokenOutput = expectedTokenOutput.div(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//        // Set a deadline for the swap (using a future timestamp)
//        const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future
//
//        // Approve the contract to spend caller's base tokens
//        await baseToken.approve(contractInstance.address, baseInputAmount, { from: accounts[0] });
//
//        // Perform the swap operation
//        await contractInstance.swapBaseToTokenWithBaseInput(baseInputAmount, expectedTokenOutput, deadline, { from: accounts[0] });
//
//        // Retrieve the final reserves and scale them to 18 decimals
//        const finalReserves = await contractInstance.getTotalReserve();
//        const finalTokenReserve = finalReserves['1'].mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//        // Calculate the actual token output (scaled to 18 decimals)
//        let actualTokenOutput = initialTokenReserve.sub(finalTokenReserve);
//        actualTokenOutput = actualTokenOutput.div(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//        // Verify that the actual token output matches the expected token output
//        assert.equal(actualTokenOutput.toString(), expectedTokenOutput.toString(), "Token output from swap is not as expected");
//    });
//
//    it("should correctly handle swapTokenToBaseWithTokenInput", async () => {
//        // Generate a random floating-point value between 1 and 1000, with token decimal point
//        const randomTokenInput = (Math.random() * 999 + 1).toFixed(tradeDecimals);
//
//        // Convert the random floating-point value to the appropriate token decimals
//        const tokenInputAmount = web3.utils.toBN(web3.utils.toWei(randomTokenInput, 'ether')).div(web3.utils.toBN(10**(18 - tradeDecimals)));
//        
//        console.log("Random token input amount (in token decimals):", tokenInputAmount.toString());
//
//        // Retrieve the initial reserves and scale them to 18 decimals
//        const initialReserves = await contractInstance.getTotalReserve();
//        const initialBaseReserve = initialReserves['0'].mul(web3.utils.toBN(10**(18 - baseDecimals)));
//        const initialTokenReserve = initialReserves['1'].mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//        // Calculate the trade fee and subtract it from the token input (scaled to 18 decimals)
//        const TRADE_FEE = await contractInstance.TRADE_FEE();
//        const tradeFee = tokenInputAmount.mul(web3.utils.toBN(10**(18 - tradeDecimals))).mul(TRADE_FEE).div(new web3.utils.BN(1000));
//        const tokenInputAmountAfterFee = tokenInputAmount.mul(web3.utils.toBN(10**(18 - tradeDecimals))).sub(tradeFee);
//
//        // Apply the x * y = k formula to calculate the expected base output (scaled to 18 decimals)
//        const k = initialBaseReserve.mul(initialTokenReserve);
//        let expectedBaseOutput = initialBaseReserve.sub(k.div(initialTokenReserve.add(tokenInputAmountAfterFee)));
//        expectedBaseOutput = expectedBaseOutput.div(web3.utils.toBN(10**(18 - baseDecimals)));
//        // Set a deadline for the swap (using a future timestamp)
//        const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future
//
//        // Approve the contract to spend caller's trade tokens
//        await tradeToken.approve(contractInstance.address, tokenInputAmount, { from: accounts[0] });
//
//        // Perform the swap operation
//        await contractInstance.swapTokenToBaseWithTokenInput(tokenInputAmount, expectedBaseOutput, deadline, { from: accounts[0] });
//
//        // Retrieve the final reserves and scale them to 18 decimals
//        const finalReserves = await contractInstance.getTotalReserve();
//        const finalBaseReserve = finalReserves['0'].mul(web3.utils.toBN(10**(18 - baseDecimals)));
//
//        // Calculate the actual base output (scaled to 18 decimals)
//        let actualBaseOutput = initialBaseReserve.sub(finalBaseReserve);
//        actualBaseOutput = actualBaseOutput.div(web3.utils.toBN(10**(18 - baseDecimals)));
//
//        // Verify that the actual base output matches the expected base output
//        assert.equal(actualBaseOutput.toString(), expectedBaseOutput.toString(), "Base output from swap is not as expected");
//    });
//
//    it("should correctly handle removing liquidity", async () => {
//        // Define the parameters for adding liquidity (scaled to respective decimals)
//        const minLP = web3.utils.toWei('1', 'ether');
//        const baseInputAmount = web3.utils.toBN('2').mul(web3.utils.toBN(10**baseDecimals));
//        const maxTokenInputAmount = web3.utils.toBN('20').mul(web3.utils.toBN(10**tradeDecimals));
//        const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future
//
//        // Approve the contract to spend LP's tokens
//        const lpAddress = accounts[1];
//
//        // Add liquidity
//        await contractInstance.addLP(minLP, baseInputAmount, maxTokenInputAmount, deadline, { from: lpAddress });
//
//        // Retrieve the initial reserves (scaled to 18 decimals)
//        const initialReserves = await contractInstance.getTotalReserve();
//        const initialBaseReserve = initialReserves['0'].mul(web3.utils.toBN(10**(18 - baseDecimals)));
//        const initialTokenReserve = initialReserves['1'].mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//        const initialTotalSupply = await contractInstance.totalSupply();
//
//        // Define the amount of LP tokens to remove and minimum acceptable outputs (scaled to 18 decimals)
//        const lpTokensToRemove = await contractInstance.balanceOf(lpAddress);
//        const minBaseOutput = web3.utils.toBN('1').mul(web3.utils.toBN(10**baseDecimals));
//        const minTokenOutput = web3.utils.toBN('1').mul(web3.utils.toBN(10**tradeDecimals));
//
//        // Call the function to remove liquidity
//        await contractInstance.removeLP(lpTokensToRemove, minBaseOutput, minTokenOutput, deadline, { from: lpAddress });
//
//        // Retrieve the final reserves (scaled to 18 decimals)
//        const finalReserves = await contractInstance.getTotalReserve();
//        const finalBaseReserve = finalReserves['0'].mul(web3.utils.toBN(10**(18 - baseDecimals)));
//        const finalTokenReserve = finalReserves['1'].mul(web3.utils.toBN(10**(18 - tradeDecimals)));
//
//        // Calculate the expected base and trade token returns (scaled to 18 decimals)
//        const expectedBaseReturn = lpTokensToRemove.mul(initialBaseReserve).div(initialTotalSupply);
//        const expectedTradeReturn = lpTokensToRemove.mul(initialTokenReserve).div(initialTotalSupply);
//
//        // Assert that the final reserves match the expected values after removing liquidity
//        assert.equal(finalBaseReserve.toString(), initialBaseReserve.sub(expectedBaseReturn).toString(), "Final base reserve is incorrect");
//        assert.equal(finalTokenReserve.toString(), initialTokenReserve.sub(expectedTradeReturn).toString(), "Final trade reserve is incorrect");
//    });

    it("should use entire balance when attempting to swap with higher input amount swapBaseToTokenWithBaseInput", async () => {
        // Define the amount of base tokens to swap, exceeding the caller's balance
        const baseInputAmount = web3.utils.toBN('10000000000000000000000000000000000000000000000000000000001').mul(web3.utils.toBN(10**baseDecimals)); // 100 base tokens

        // Retrieve the caller's current base token balance
        const callerBaseBalance = await baseToken.balanceOf(accounts[0]);

        // Verify that the caller's balance is less than the base input amount
        assert(baseInputAmount.gt(callerBaseBalance), "Caller must have insufficient balance for this test");

        // Set a minimum acceptable token output (scaled to tradeDecimals)
        const minTokenOutput = web3.utils.toBN('1').mul(web3.utils.toBN(10**tradeDecimals)); // 1 trade token

        // Set a deadline for the swap (using a future timestamp)
        const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future

        // Approve the contract to spend caller's base tokens
        await baseToken.approve(contractInstance.address, baseInputAmount, { from: accounts[0] });

        // Perform the swap operation
        await contractInstance.swapBaseToTokenWithBaseInput(baseInputAmount, minTokenOutput, deadline, { from: accounts[0] });

        // Retrieve the caller's final base token balance
        const finalCallerBaseBalance = await baseToken.balanceOf(accounts[0]);

        // Assert that the caller's entire balance has been used for the swap
        assert.equal(finalCallerBaseBalance.toString(), '0', "Caller's entire balance was not used for the swap");
    });
    
    it("should use entire balance when attempting to swap trade tokens with higher input amount swapTokenToBaseWithTokenInput", async () => {
        // Define the amount of trade tokens to swap, exceeding the caller's balance
        const tokenInputAmount = web3.utils.toBN('10000000000000000000000000000000000000000000000000000000001').mul(web3.utils.toBN(10**tradeDecimals)); // 100 trade tokens

        // Retrieve the caller's current trade token balance
        const callerTradeBalance = await tradeToken.balanceOf(accounts[0]);

        // Verify that the caller's balance is less than the trade input amount
        assert(tokenInputAmount.gt(callerTradeBalance), "Caller must have insufficient balance for this test");

        // Set a minimum acceptable base output (scaled to baseDecimals)
        const minBaseOutput = web3.utils.toBN('1').mul(web3.utils.toBN(10**baseDecimals)); // 1 base token

        // Set a deadline for the swap (using a future timestamp)
        const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future

        // Approve the contract to spend caller's trade tokens
        await tradeToken.approve(contractInstance.address, tokenInputAmount, { from: accounts[0] });

        // Perform the swap operation
        await contractInstance.swapTokenToBaseWithTokenInput(tokenInputAmount, minBaseOutput, deadline, { from: accounts[0] });

        // Retrieve the caller's final trade token balance
        const finalCallerTradeBalance = await tradeToken.balanceOf(accounts[0]);

        // Assert that the caller's entire trade balance has been used for the swap
        assert.equal(finalCallerTradeBalance.toString(), '0', "Caller's entire trade balance was not used for the swap");
    });



//    it("should correctly handle edge case with zero base token input", async () => {
//      // Define zero base input amount
//      const zeroBaseInput = web3.utils.toWei('0', 'ether');
//
//      // Set a minimum acceptable output and deadline
//      const minOutput = web3.utils.toWei('0', 'ether');
//      const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future
//
//      // Test with zero base input for swapping base to token
//      try {
//        await contractInstance.swapBaseToTokenWithBaseInput(zeroBaseInput, minOutput, deadline, { from: accounts[0] });
//        assert.fail("Expected revert not received");
//      } catch (error) {
//        assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
//      }
//    });
//
//    it("should correctly handle edge case with zero trade token input", async () => {
//        // Define zero token input amount
//        const zeroTokenInput = web3.utils.toWei('0', 'ether');
//
//        // Set a minimum acceptable output and deadline
//        const minOutput = web3.utils.toWei('0', 'ether');
//        const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future
//
//        // Test with zero token input for swapping token to base
//        try {
//          await contractInstance.swapTokenToBaseWithTokenInput(zeroTokenInput, minOutput, deadline, { from: accounts[0] });
//          assert.fail("Expected revert not received");
//        } catch (error) {
//          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
//        }
//      });
//      
//    it("should allow owner to set whitelist contract", async () => {
//        const newWhitelistContractAddress = accounts[2]; // Replace with the appropriate address
//        try {
//          await contractInstance.setWhitelistContract(newWhitelistContractAddress, { from: accounts[0] });
//        } catch (error) {
//          assert.fail("Function call by owner should not have failed");
//        }
//     });
////
//    it("should not allow non-owner to set whitelist contract", async () => {
//      const newWhitelistContractAddress = accounts[2];
//      try {
//        await contractInstance.setWhitelistContract(newWhitelistContractAddress, { from: accounts[1] });
//        assert.fail("Expected revert not received");
//      } catch (error) {
//        assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
//      }
//    });
////    
//    it("should allow owner to set fee machine contract", async () => {
//        const newFeeMachineContractAddress = accounts[3]; // Replace with the appropriate address
//        try {
//          await contractInstance.setFeeMachineContract(newFeeMachineContractAddress, { from: accounts[0] });
//        } catch (error) {
//          assert.fail("Function call by owner should not have failed");
//        }
//    });
////
//    it("should not allow non-owner to set fee machine contract", async () => {
//      const newFeeMachineContractAddress = accounts[3];
//      try {
//        await contractInstance.setFeeMachineContract(newFeeMachineContractAddress, { from: accounts[1] });
//        assert.fail("Expected revert not received");
//      } catch (error) {
//        assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
//      }
//    });
////    
//    it("should allow owner to set trade fee", async () => {
//        const newTradeFee = 10; // Replace with the appropriate value
//        try {
//          await contractInstance.setTradeFee(newTradeFee, { from: accounts[0] });
//        } catch (error) {
//          assert.fail("Function call by owner should not have failed");
//        }
//      });
//
//      it("should not allow non-owner to set trade fee", async () => {
//        const newTradeFee = 10;
//        try {
//          await contractInstance.setTradeFee(newTradeFee, { from: accounts[1] });
//          assert.fail("Expected revert not received");
//        } catch (error) {
//          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
//        }
//      });
////    
//    it("should allow owner to set platform fee", async () => {
//        const newPlatformFee = 5; // Replace with the appropriate value
//        try {
//          await contractInstance.setPlatformFee(newPlatformFee, { from: accounts[0] });
//        } catch (error) {
//          assert.fail("Function call by owner should not have failed");
//        }
//      });
////
//      it("should not allow non-owner to set platform fee", async () => {
//        const newPlatformFee = 5;
//        try {
//          await contractInstance.setPlatformFee(newPlatformFee, { from: accounts[1] });
//          assert.fail("Expected revert not received");
//        } catch (error) {
//          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
//        }
//      });
////
//    it("should allow owner to set platform fund address", async () => {
//        const newPlatformFundAddress = accounts[4]; // Replace with the appropriate address
//        try {
//          await contractInstance.setPlatformFundAdress(newPlatformFundAddress, { from: accounts[0] });
//        } catch (error) {
//          assert.fail("Function call by owner should not have failed");
//        }
//      });
////
//      it("should not allow non-owner to set platform fund address", async () => {
//        const newPlatformFundAddress = accounts[4];
//        try {
//          await contractInstance.setPlatformFundAdress(newPlatformFundAddress, { from: accounts[1] });
//          assert.fail("Expected revert not received");
//        } catch (error) {
//          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
//        }
//      });
////
//    it("should allow owner to pause contract", async () => {
//        try {
//          await contractInstance.pause({ from: accounts[0] });
//        } catch (error) {
//          assert.fail("Function call by owner should not have failed");
//        }
//      });
////
//      it("should not allow non-owner to pause contract", async () => {
//        try {
//          await contractInstance.pause({ from: accounts[1] });
//          assert.fail("Expected revert not received");
//        } catch (error) {
//          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
//        }
//      });
//      
//    it("should allow owner to unpause contract", async () => {
//        try {
//          await contractInstance.pause({ from: accounts[0] });
//          await contractInstance.unpause({ from: accounts[0] });
//        } catch (error) {
//          assert.fail("Function call by owner should not have failed");
//        }
//      });
//
//      it("should not allow non-owner to unpause contract", async () => {
//        try {
//          await contractInstance.pause({ from: accounts[0] });
//          await contractInstance.unpause({ from: accounts[1] });
//          assert.fail("Expected revert not received");
//        } catch (error) {
//          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
//        }
//      });
});
