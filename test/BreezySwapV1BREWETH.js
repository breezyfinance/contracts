const BreezySwapV1BREWETH = artifacts.require("BreezySwapV1BREWETH");
const BreezyWhitelist = artifacts.require("BreezyWhitelist");
const CustomERC20Mintable  = artifacts.require("CustomERC20Mintable");

contract("BreezySwapV1BREWETH", (accounts) => {
  let contractInstance;
  let baseToken;
  let tradeToken;

  beforeEach(async () => {
    // Deploy mock ERC20 tokens
    baseToken = await CustomERC20Mintable .new("BaseToken", "BASE");
    tradeToken = await CustomERC20Mintable .new("TradeToken", "TRADE");

    // Define LP's address and initial amounts for liquidity
    const lpAddress = accounts[1];
    const initialBaseLiquidity = web3.utils.toWei('1000', 'ether');
    const initialTradeLiquidity = web3.utils.toWei('1000', 'ether');

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
    const minLP = web3.utils.toWei('1', 'ether');
    const baseInputAmountForLP = web3.utils.toWei('1', 'ether');
    const maxTokenInputAmountForLP = web3.utils.toWei('1', 'ether');
    const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
    // Call the addLP function to add liquidity
    await contractInstance.addLP(minLP, baseInputAmountForLP, maxTokenInputAmountForLP, deadline, { from: lpAddress });
  });

//  it("should correctly calculate token output from base input", async () => {
//    // Define the base input amount (e.g., 1 ether)
//    const baseInputAmount = web3.utils.toWei('1', 'ether');
//
//    // Retrieve the base and token reserves
//    const reserves = await contractInstance.getTotalReserve();
//    const baseReserve = reserves['0'];
//    const tokenReserve = reserves['1'];
//
//    // Calculate the trade fee and subtract it from the base input
//    const TRADE_FEE = await contractInstance.TRADE_FEE();
//    const tradeFee =  new web3.utils.BN(baseInputAmount).mul(TRADE_FEE).div(new web3.utils.BN(1000));
//    const baseInputAmountAfterFee = new web3.utils.BN(baseInputAmount).sub(tradeFee);
//
//    // Apply the x * y = k formula to calculate the expected token output
//    const k = new web3.utils.BN(baseReserve).mul(new web3.utils.BN(tokenReserve));
//    const expectedTokenOutput = new web3.utils.BN(tokenReserve).sub(k.div(new web3.utils.BN(baseReserve).add(baseInputAmountAfterFee)));
//
//    // Call the function to calculate the token output
//    const calculatedTokenOutput = await contractInstance.getTokenOutput(baseInputAmount);
//
//    // Assert that the calculated token output is correct
//    assert.equal(calculatedTokenOutput.toString(), expectedTokenOutput.toString(), "Calculated token output is incorrect");
//  });
//
//  it("should correctly calculate LP tokens when adding liquidity", async () => {
//    // Define the amounts of base and trade tokens to add as liquidity
//    const baseLiquidityAmount = web3.utils.toWei('0.000000000000000001', 'ether');
//    const tradeLiquidityAmount = web3.utils.toWei('10', 'ether');
//
//    // Approve the contract to spend LP's tokens
//    const lpAddress = accounts[1];
//
//    // Retrieve the total supply of LP tokens before adding liquidity
//    const totalSupplyBefore = await contractInstance.totalSupply();
//    
//    // Retrieve the base and token reserves
//    const reserves = await contractInstance.getTotalReserve();
//
//    // Add liquidity
//    const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
//    await contractInstance.addLP(1, baseLiquidityAmount, tradeLiquidityAmount, deadline, { from: lpAddress });
//
//    // Retrieve the total supply of LP tokens after adding liquidity
//    const totalSupplyAfter = await contractInstance.totalSupply();
//    
//    // Calculate the expected increase in LP tokens
//    const expectedLPTokens = new web3.utils.BN(baseLiquidityAmount).mul(new web3.utils.BN(totalSupplyBefore)).div(new web3.utils.BN(reserves['0']));
//
//    // Assert that the total supply of LP tokens increased by the expected amount
//    assert.equal(totalSupplyAfter.sub(totalSupplyBefore).toString(), expectedLPTokens.toString(), "LP tokens calculation is incorrect");
//  });
//
//    it("should handle swapBaseToTokenWithBaseInput", async () => {
//      // Define the amount of base tokens to swap (e.g., 1 ether)
//      const baseInputAmount = web3.utils.toWei('1', 'ether');
//
//      // Set a minimum acceptable token output (you can adjust this as needed)
//      const minTokenOutput = web3.utils.toWei('0.1', 'ether');
//
//      // Set a deadline for the swap (using a future timestamp)
//      const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future
//
//      // Approve the contract to spend caller's base tokens
//      await baseToken.approve(contractInstance.address, baseInputAmount, { from: accounts[0] });
//
//      // Retrieve the initial reserves
//      const initialReserves = await contractInstance.getTotalReserve();
//      const initialBaseReserve = initialReserves['0'];
//      const initialTokenReserve = initialReserves['1'];
//
//      // Perform the swap operation
//      await contractInstance.swapBaseToTokenWithBaseInput(baseInputAmount, minTokenOutput, deadline, { from: accounts[0] });
//
//      // Retrieve the final reserves
//      const finalReserves = await contractInstance.getTotalReserve();
//      const finalTokenReserve = finalReserves['1'];
//
//      // Calculate the actual token output
//      const actualTokenOutput = new web3.utils.BN(initialTokenReserve).sub(new web3.utils.BN(finalTokenReserve));
//
//      // Verify that the actual token output is greater or equal to the minimum acceptable output
//      assert(new web3.utils.BN(actualTokenOutput).gte(new web3.utils.BN(minTokenOutput)), "Token output from swap is less than the minimum acceptable output");
//    });

//    it("should handle swapTokenToBaseWithTokenInput ", async () => {
//      // Define the amount of trade tokens to swap (e.g., 1 ether)
//      const tokenInputAmount = web3.utils.toWei('1', 'ether');
//
//      // Set a minimum acceptable base output (you can adjust this as needed)
//      const minBaseOutput = web3.utils.toWei('0.1', 'ether');
//
//      // Set a deadline for the swap (using a future timestamp)
//      const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future
//
//      // Approve the contract to spend caller's trade tokens
//      await tradeToken.approve(contractInstance.address, tokenInputAmount, { from: accounts[0] });
//
//      // Retrieve the initial reserves
//      const initialReserves = await contractInstance.getTotalReserve();
//      const initialBaseReserve = initialReserves['0'];
//      const initialTokenReserve = initialReserves['1'];
//
//      // Perform the swap operation
//      await contractInstance.swapTokenToBaseWithTokenInput(tokenInputAmount, minBaseOutput, deadline, { from: accounts[0] });
//
//      // Retrieve the final reserves
//      const finalReserves = await contractInstance.getTotalReserve();
//      const finalBaseReserve = finalReserves['0'];
//
//      // Calculate the actual base output
//      const actualBaseOutput = new web3.utils.BN(initialBaseReserve).sub(new web3.utils.BN(finalBaseReserve));
//
//      // Verify that the actual base output is greater or equal to the minimum acceptable output
//      assert(new web3.utils.BN(actualBaseOutput).gte(new web3.utils.BN(minBaseOutput)), "Base output from swap is less than the minimum acceptable output");
//    });

//
//    it("should correctly handle removing liquidity", async () => {
//      // Define the parameters for adding liquidity
//      const minLP = web3.utils.toWei('1', 'ether');
//      const baseInputAmount = web3.utils.toWei('2', 'ether');
//      const maxTokenInputAmount = web3.utils.toWei('20', 'ether');
//      const deadline = (await web3.eth.getBlock('latest')).timestamp + 600; // 10 minutes in the future
//
//      // Approve the contract to spend LP's tokens
//      const lpAddress = accounts[1];
//
//      // Add liquidity
//      await contractInstance.addLP(minLP, baseInputAmount, maxTokenInputAmount, deadline, { from: lpAddress });
//
//      // Retrieve the initial reserves and total supply of LP tokens
//      const initialReserves = await contractInstance.getTotalReserve();
//      const initialTotalSupply = await contractInstance.totalSupply();
//
//       // Define the amount of LP tokens to remove and minimum acceptable outputs
//        const lpTokensToRemove = await contractInstance.balanceOf(lpAddress);
//        const minBaseOutput = web3.utils.toWei('1', 'ether'); // Adjust as needed
//        const minTokenOutput = web3.utils.toWei('1', 'ether'); // Adjust as needed
//
//        // Call the function to remove liquidity
//        await contractInstance.removeLP(lpTokensToRemove, minBaseOutput, minTokenOutput, deadline, { from: lpAddress });
//
//      // Retrieve the final reserves
//      const finalReserves = await contractInstance.getTotalReserve();
//
//      // Calculate the expected base and trade token returns
//      const expectedBaseReturn = lpTokensToRemove.mul(initialReserves['0']).div(initialTotalSupply);
//      const expectedTradeReturn = lpTokensToRemove.mul(initialReserves['1']).div(initialTotalSupply);
//
//      // Assert that the final reserves match the expected values after removing liquidity
//      assert.equal(finalReserves['0'].toString(), initialReserves['0'].sub(expectedBaseReturn).toString(), "Final base reserve is incorrect");
//      assert.equal(finalReserves['1'].toString(), initialReserves['1'].sub(expectedTradeReturn).toString(), "Final trade reserve is incorrect");
//    });

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
    it("should allow owner to set whitelist contract", async () => {
        const newWhitelistContractAddress = accounts[2]; // Replace with the appropriate address
        try {
          await contractInstance.setWhitelistContract(newWhitelistContractAddress, { from: accounts[0] });
        } catch (error) {
          assert.fail("Function call by owner should not have failed");
        }
     });

    it("should not allow non-owner to set whitelist contract", async () => {
      const newWhitelistContractAddress = accounts[2];
      try {
        await contractInstance.setWhitelistContract(newWhitelistContractAddress, { from: accounts[1] });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
      }
    });
    
    it("should allow owner to set fee machine contract", async () => {
        const newFeeMachineContractAddress = accounts[3]; // Replace with the appropriate address
        try {
          await contractInstance.setFeeMachineContract(newFeeMachineContractAddress, { from: accounts[0] });
        } catch (error) {
          assert.fail("Function call by owner should not have failed");
        }
    });

    it("should not allow non-owner to set fee machine contract", async () => {
      const newFeeMachineContractAddress = accounts[3];
      try {
        await contractInstance.setFeeMachineContract(newFeeMachineContractAddress, { from: accounts[1] });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
      }
    });
    
    it("should allow owner to set trade fee", async () => {
        const newTradeFee = 10; // Replace with the appropriate value
        try {
          await contractInstance.setTradeFee(newTradeFee, { from: accounts[0] });
        } catch (error) {
          assert.fail("Function call by owner should not have failed");
        }
      });

      it("should not allow non-owner to set trade fee", async () => {
        const newTradeFee = 10;
        try {
          await contractInstance.setTradeFee(newTradeFee, { from: accounts[1] });
          assert.fail("Expected revert not received");
        } catch (error) {
          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
        }
      });
    
    it("should allow owner to set platform fee", async () => {
        const newPlatformFee = 5; // Replace with the appropriate value
        try {
          await contractInstance.setPlatformFee(newPlatformFee, { from: accounts[0] });
        } catch (error) {
          assert.fail("Function call by owner should not have failed");
        }
      });

      it("should not allow non-owner to set platform fee", async () => {
        const newPlatformFee = 5;
        try {
          await contractInstance.setPlatformFee(newPlatformFee, { from: accounts[1] });
          assert.fail("Expected revert not received");
        } catch (error) {
          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
        }
      });

    it("should allow owner to set platform fund address", async () => {
        const newPlatformFundAddress = accounts[4]; // Replace with the appropriate address
        try {
          await contractInstance.setPlatformFundAdress(newPlatformFundAddress, { from: accounts[0] });
        } catch (error) {
          assert.fail("Function call by owner should not have failed");
        }
      });

      it("should not allow non-owner to set platform fund address", async () => {
        const newPlatformFundAddress = accounts[4];
        try {
          await contractInstance.setPlatformFundAdress(newPlatformFundAddress, { from: accounts[1] });
          assert.fail("Expected revert not received");
        } catch (error) {
          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
        }
      });

    it("should allow owner to pause contract", async () => {
        try {
          await contractInstance.pause({ from: accounts[0] });
        } catch (error) {
          assert.fail("Function call by owner should not have failed");
        }
      });

      it("should not allow non-owner to pause contract", async () => {
        try {
          await contractInstance.pause({ from: accounts[1] });
          assert.fail("Expected revert not received");
        } catch (error) {
          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
        }
      });
      
    it("should allow owner to unpause contract", async () => {
        try {
          await contractInstance.unpause({ from: accounts[0] });
        } catch (error) {
          assert.fail("Function call by owner should not have failed");
        }
      });

      it("should not allow non-owner to unpause contract", async () => {
        try {
          await contractInstance.unpause({ from: accounts[1] });
          assert.fail("Expected revert not received");
        } catch (error) {
          assert(error.message.includes("revert"), "Expected revert, got: " + error.message);
        }
      });



});
