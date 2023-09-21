const XBOT = artifacts.require("XBOT");

contract("XBOT", accounts => {
    // it("should allow users to buy tokens", async () => {
    //     const xbotInstance = await XBOT.new();

    //     for (let i = 0; i < 10; i++) {
    //         console.log(`account[${i}]: ${accounts[i]}`);
    //         let cal = parseFloat((Math.random() * (2 - 0.00001) + 0.00001)).toFixed(18);
    //         let etherAmount = web3.utils.toWei(cal.toString(), "ether");
    //         // console.log("🚀 etherAmount:", etherAmount/1e18, "ETH");
    //         await xbotInstance.buy(accounts[i], { from: accounts[i], value: etherAmount});
    //         const profitPerShare = await xbotInstance.profitPerShare_();
    //         // console.log("🚀 profitPerShare:", profitPerShare.toString())
    //         const totalSupply = await xbotInstance.totalSupply();
    //         // console.log("🚀 totalSupply:", totalSupply.toString() / 1e18, "XBOT");
    //         // console.log();
    //     }

    //     // let etherAmount = ["0.29908454661850903", "0.9722593862812304", "1.23123"];

    //     // for (let i = 0; i < etherAmount.length; i++) {
    //     //     let amount = web3.utils.toWei(etherAmount[i], "ether");
    //     //     console.log("🚀 ~ file: XBOT.js:22 ~ it ~ etherAmount:", amount / 1e18, "ETH");
    //     //     await xbotInstance.buy(accounts[i], { from: accounts[i], value: amount});
    //     //     const totalSupply = await xbotInstance.totalSupply();
    //     //     console.log("🚀 ~ file: XBOT.js:27 ~ it ~ totalSupply:", totalSupply.toString() / 1e18);
    //     //     const profitPerShare = await xbotInstance.profitPerShare_();
    //     //     console.log("🚀 ~ file: XBOT.js:29 ~ it ~ profitPerShare:", profitPerShare.toString());
    //     //     console.log();
    //     // }
    // });

    // it("shout allow users check amount token out of Buy tokens", async () => {
    //     const xbotInstance = await XBOT.new();

    //     let totalAmountOut = 0;
    //     for (let i = 0; i < 10; i++) {
    //         let cal = parseFloat((Math.random() * (0.001 - 0.00001) + 0.00001)).toFixed(18);
    //         let etherAmount = web3.utils.toWei(cal.toString(), "ether");
    //         // console.log("🚀 etherAmount:", etherAmount / 1e18)
    //         const _amountOut = await xbotInstance.getAmountOut(etherAmount);
    //         // console.log("🚀 getAmountOut:", _amountOut.toString() / 1e18)
    //         await xbotInstance.buy(accounts[0], { from: accounts[0], value: etherAmount});
    //         totalAmountOut = BigInt(totalAmountOut) + BigInt(_amountOut);
    //         // console.log("🚀 totalAmountOut:", totalAmountOut.toString() / 1e18)
    //         // console.log();
    //     }
        
    //     let _balanceOf = await xbotInstance.balanceOf(accounts[0]);
    //     assert.equal(totalAmountOut.toString(), _balanceOf.toString(), "error");
    // });

    // it("shout allow users check amount eth out of Exit tokens", async () => {
    //     const xbotInstance = await XBOT.new();
    //     let beforBalanceEthOf0 = await web3.eth.getBalance(accounts[0]);
    //     console.log("🚀 balance Eth befor buy:", beforBalanceEthOf0.toString() / 1e18)

    //     let etherAmount = web3.utils.toWei("10", "ether");
    //     console.log("🚀 etherAmount buy:", etherAmount / 1e18);

    //     let _amountOut = await xbotInstance.calculateTokenOut(etherAmount);
    //     console.log("🚀 get amount token received:", _amountOut.toString() / 1e18);

    //     await xbotInstance.buy(accounts[0], { from: accounts[0], value: etherAmount});

    //     let beforBalanceEthOf = await web3.eth.getBalance(accounts[0]);
    //     console.log("🚀 balance Eth after buy:", beforBalanceEthOf.toString() / 1e18)

    //     let dividendsOf = await xbotInstance.dividendsOf(accounts[0]);
    //     console.log("🚀 dividendsOf:", dividendsOf.toString() / 1e18)

    //     let beforBalanceTokenOf = await xbotInstance.balanceOf(accounts[0]);
    //     console.log("🚀 Balance token after buy:", beforBalanceTokenOf.toString() / 1e18)

    //     let totalSupply = await xbotInstance.totalSupply();
    //     console.log("🚀 totalSupply:", totalSupply.toString() / 1e18)

    //     let amountIn = await xbotInstance.calculateEthereumOut(beforBalanceTokenOf.toString());
    //     console.log("🚀 get Amount eth received:", amountIn.toString() / 1e18);

    //     await xbotInstance.exit({from: accounts[0]});

    //     let afterBalanceTokenOf = await xbotInstance.balanceOf(accounts[0]);
    //     console.log("🚀 Balance Token after exit:", afterBalanceTokenOf.toString() / 1e18);

    //     let afterBalanceEthOf = await web3.eth.getBalance(accounts[0]);
    //     console.log("🚀 Balance Eth after exit:", afterBalanceEthOf.toString() / 1e18)

    // });

    // it("shout allow users check eth input of Buy tokens", async () => {
    //     const xbotInstance = await XBOT.new();
    //     let account = accounts[0];
    //     let amountOut = "42416.408049704136";
    //     let amountToken= web3.utils.toWei(amountOut, "ether");

    //     let amountIn = await xbotInstance.getAmountIn(amountToken, xbotInstance.address);
    //     console.log("🚀 get Amount eth input:", amountIn.toString() / 1e18);
    //     await xbotInstance.buy(accounts[0], {from: account, value: amountIn});

    //     let balanceOf = await xbotInstance.balanceOf(account);
    //     console.log("🚀 bananceOf:", balanceOf.toString() / 1e18)

    //     assert.equal(balanceOf.toString() / 1e18, amountOut.toString(), "error");
    // });

    // it("check ratio get token input with etherum output on sell token", async () => {
    //     const xbotInstance = await XBOT.new();
    //     let account = accounts[0];
    //     let amountEth = web3.utils.toWei("50", "ether");
    //     await xbotInstance.buy(account, {from: account, value: amountEth});
    //     let totalRatio = 0;
    //     for (let i = 0; i < 10000; i++) {
    //         let randomTokenIn = parseFloat((Math.random() * (80000- 0.00001) + 0.00001)).toFixed(18);
    //         let amountTokenIn0 = web3.utils.toWei(randomTokenIn.toString(), "ether");
    //         let amountEthReceived = await xbotInstance.tokensToEthereum_(amountTokenIn0);
    //         let amountTokenIn1 = await xbotInstance.getTokenInputOfEthereumOutput(amountEthReceived.toString());
    //         let ratio = (amountTokenIn1 / amountTokenIn0) * 100;

    //         console.log("[",i,"]"," 🚀 ~ input: ", amountTokenIn0.toString() / 1e18,
    //                     ". output: ", amountTokenIn1.toString() / 1e18, 
    //                     ". => ratio:", ratio, "%");
    //         console.log();
    //         totalRatio = (totalRatio + ratio);
    //     }
    //     console.log("🚀 ~ ratioAverage:", totalRatio / 10000, "%")     
    // })
    // it("check get amout in when sell token", async () => {
    //     let nullAddress = "0x0000000000000000000000000000000000000000";
    //     const xbotInstance = await XBOT.new();
    //     let account = accounts[0];
    //     let amountEthBuy = web3.utils.toWei("20", "ether");
    //     await xbotInstance.buy(account, {from: account, value: amountEthBuy});

    //     let amountEthWant = web3.utils.toWei("10", "ether");

    //     let balanceETH = await web3.eth.getBalance(account);
    //     // console.log("🚀 ~ balanceETH0:", balanceETH.toString() / 1e18);

    //     let balanceOf = await xbotInstance.balanceOf(account);
    //     // console.log("🚀 ~ bananceOf:", balanceOf.toString() / 1e18);

    //     let amountTokenIn = await xbotInstance.getAmountIn(amountEthWant, nullAddress);
    //     console.log("🚀 ~ amountTokenIn:", (amountTokenIn).toString() / 1e18);

    //     let ethOut = await xbotInstance.calculateEthereumOut(amountTokenIn.toString());
    //     console.log("🚀 ~ ethOut:", ethOut.toString() / 1e18)

    //     assert.equal(Math.round((ethOut / amountEthWant) * 100), 100, "error");
    // })
    it("should return correct balance when buy and exit", async () => {
         let nullAddress = "0x0000000000000000000000000000000000000000";
         const xbotInstance = await XBOT.new();
         let account = accounts[0];
         let amountEthBuy = web3.utils.toWei("50", "ether");
         let initBalance = await web3.eth.getBalance(account)/1e18;
         console.log(initBalance);
         await xbotInstance.buy(nullAddress, {from: accounts[1], value: amountEthBuy});
         await xbotInstance.buy(nullAddress, {from: account, value: amountEthBuy});    
         let profitPerShare = await xbotInstance.profitPerShare_();
         console.log(profitPerShare.toString());
         await xbotInstance.exit({from: account});

         let balanceETH = await web3.eth.getBalance(account)/1e18;
         console.log("balanceETH0:", balanceETH);

         assert.equal(initBalance - 50*14/100, balanceETH, "error");
    })

    
})