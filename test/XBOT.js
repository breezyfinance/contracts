const XBOT = artifacts.require("XBOT");
const test = artifacts.require("test");
const XBOTTreasury = artifacts.require("XBOTTreasury");
const ReferralContract = artifacts.require("ReferralContract");

let xbotInstance, ReferralInstance, XBOTTreasuryInstance;
let nullAddress = "0x0000000000000000000000000000000000000000";

contract("XBOT", accounts => {
    beforeEach(async () => {
        xbotInstance = await XBOT.new();
        ReferralInstance = await ReferralContract.new();
        XBOTTreasuryInstance = await XBOTTreasury.new();
        
        const referralCodeByOwner = web3.utils.asciiToHex("owner");

        await ReferralInstance.setReferralCode(referralCodeByOwner);
        await xbotInstance.setReferralContract(ReferralInstance.address);
        await xbotInstance.setReferralCodeByOwner(referralCodeByOwner);
    })
//    it("should allow users to buy tokens", async () => {
//        for (let i = 0; i < 10; i++) {
//            console.log(`account[${i}]: ${accounts[i]}`);
//            let cal = parseFloat((Math.random() * (2 - 0.00001) + 0.00001)).toFixed(18);
//            let etherAmount = web3.utils.toWei(cal.toString(), "ether");
//         //    console.log("🚀 etherAmount:", etherAmount/1e18, "ETH");
//            let getMinTokenOut = await xbotInstance.getAmountOut(etherAmount, nullAddress);

//            await xbotInstance.buy(accounts[i], getMinTokenOut, { from: accounts[i], value: etherAmount});
//            const profitPerShare = await xbotInstance.profitPerShare_();
//            console.log("🚀 profitPerShare:", profitPerShare.toString())
//            const totalSupply = await xbotInstance.totalSupply();
//            console.log("🚀 totalSupply:", totalSupply.toString() / 1e18, "XBOT");
//            console.log();
//        }

//        // let etherAmount = ["0.29908454661850903", "0.9722593862812304", "1.23123"];

//        // for (let i = 0; i < etherAmount.length; i++) {
//        //     let amount = web3.utils.toWei(etherAmount[i], "ether");
//        //     console.log("🚀 ~ file: XBOT.js:22 ~ it ~ etherAmount:", amount / 1e18, "ETH");
//        //     await xbotInstance.buy(accounts[i], { from: accounts[i], value: amount});
//        //     const totalSupply = await xbotInstance.totalSupply();
//        //     console.log("🚀 ~ file: XBOT.js:27 ~ it ~ totalSupply:", totalSupply.toString() / 1e18);
//        //     const profitPerShare = await xbotInstance.profitPerShare_();
//        //     console.log("🚀 ~ file: XBOT.js:29 ~ it ~ profitPerShare:", profitPerShare.toString());
//        //     console.log();
//        // }
//    });

//    it("should allow users check amount token out of Buy tokens", async () => {
//        let totalAmountOut = 0;
//        for (let i = 0; i < 10; i++) {
//            let cal = parseFloat((Math.random() * (0.001 - 0.00001) + 0.00001)).toFixed(18);
//            let etherAmount = web3.utils.toWei(cal.toString(), "ether");
//            // console.log("🚀 etherAmount:", etherAmount / 1e18)
//            const _amountOut = await xbotInstance.getAmountOut(etherAmount, nullAddress);
//            // console.log("🚀 getAmountOut:", _amountOut.toString() / 1e18)
//            await xbotInstance.buy(accounts[0], _amountOut, { from: accounts[0], value: etherAmount});
//            totalAmountOut = BigInt(totalAmountOut) + BigInt(_amountOut);
//            // console.log("🚀 totalAmountOut:", totalAmountOut.toString() / 1e18)
//            // console.log();
//        }
       
//        let _balanceOf = await xbotInstance.balanceOf(accounts[0]);
//        assert.equal(totalAmountOut.toString(), _balanceOf.toString(), "error");
//    });
//
//    it("should allow users check eth input of Buy tokens", async () => {
//        let account = accounts[0];
//        let amountOut = "42416.408049704136";
//        let amountToken= web3.utils.toWei(amountOut, "ether");
       
//        let amountIn = await xbotInstance.getAmountIn(amountToken, xbotInstance.address);
//        console.log("🚀 get Amount eth input:", amountIn.toString() / 1e18);
//        await xbotInstance.buy(accounts[0], BigInt(amountToken - amountToken * 0.5 / 100), {from: account, value: amountIn});
       
//        let balanceOf = await xbotInstance.balanceOf(account);
//        console.log("🚀 bananceOf:", balanceOf.toString() / 1e18)
       
//        assert.equal(balanceOf.toString() / 1e18, amountOut.toString(), "error");
//    });
    
    // it("check ratio get token input with etherum output on sell token", async () => {
    //     let account = accounts[0];
    //     let amountEth = web3.utils.toWei("1", "ether");
    //     await xbotInstance.buy(account, 1, {from: account, value: amountEth});
    //     let totalRatio = 0;
    //     for (let i = 0; i < 100; i++) {
    //         let randomTokenIn = parseFloat((Math.random() * (10- 0.00001) + 0.00001)).toFixed(18);
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
    //     console.log("🚀 ~ ratioAverage:", totalRatio / 100, "%")     
    // });
        

//    it("check get amout in when sell token", async () => {
//        let account = accounts[0];
//        let amountEthBuy = web3.utils.toWei("20", "ether");

//        let getMinTokenOut = await xbotInstance.getAmountOut(amountEthBuy, nullAddress);
//        await xbotInstance.buy(account, getMinTokenOut, {from: account, value: amountEthBuy});

//        let amountEthWant = web3.utils.toWei("10", "ether");

//        let balanceETH = await web3.eth.getBalance(account);
//        console.log("🚀 ~ balanceETH0:", balanceETH.toString() / 1e18);

//        let balanceOf = await xbotInstance.balanceOf(account);
//        console.log("🚀 ~ bananceOf:", balanceOf.toString() / 1e18);

//        let amountTokenIn = await xbotInstance.getAmountIn(amountEthWant, nullAddress);
//        console.log("🚀 ~ amountTokenIn:", (amountTokenIn).toString() / 1e18);

//        let ethOut = await xbotInstance.calculateEthereumOut(amountTokenIn.toString());
//        console.log("🚀 ~ ethOut:", ethOut.toString() / 1e18)

//        assert.equal(Math.round((ethOut / amountEthWant) * 100), 100, "error");
//    });
//    
//    it("should allow users check amount eth out of Exit tokens", async () => {
//        let account = accounts[1];
//        let amountEthBuy = web3.utils.toWei("20", "ether");
//        console.log("account 0 buy 20e");
//        let getMinTokenOut = await xbotInstance.getAmountOut(amountEthBuy, nullAddress);
//        await xbotInstance.buy(account, getMinTokenOut, {from: accounts[0], value: amountEthBuy});

//        console.log("account 1 buy 20e");
//        let getMinTokenOut1 = await xbotInstance.getAmountOut(amountEthBuy, nullAddress);
//        await xbotInstance.buy(account, getMinTokenOut1, {from: account, value: amountEthBuy});

//        let amountEthWant = web3.utils.toWei("10", "ether");

//        let balanceETH = await web3.eth.getBalance(account);
//        console.log("🚀 ~ balanceETH account 1 after buy:", balanceETH.toString() / 1e18);

//        let balanceOf = await xbotInstance.balanceOf(account);
//        console.log("🚀 ~ banance token account 1 after buy:", balanceOf.toString() / 1e18);

//        let amountTokenIn = await xbotInstance.getAmountIn(amountEthWant, nullAddress);
//        console.log("🚀 ~ sell 10e, get amount Token In:", (amountTokenIn).toString() / 1e18);

//        let ethOut = await xbotInstance.calculateEthereumOut(amountTokenIn.toString());
//        console.log("🚀 ~ check eth Out with amount token in:", ethOut.toString() / 1e18)

//        console.log("account 1 sell 10e");
//        await xbotInstance.sell(amountTokenIn, ethOut, {from: account});

//        console.log("account 1 withdraw");
//        await xbotInstance.withdraw({from: account});

//        console.log("account 1 exit");
//        await xbotInstance.exit({from: account});
       
//        let balanceOf1 = await xbotInstance.balanceOf(account);
//        console.log("🚀 ~ banance token account 1 after exit:", balanceOf1.toString() / 1e18);

//        let balanceETH1 = await web3.eth.getBalance(account);
//        console.log("🚀 ~ balanceETH account 1 after exit:", balanceETH1.toString() / 1e18);

//    });
    
//    it("should return correct balance when buy and exit", async () => {
//         let account = accounts[0];
//         let amountEthBuy = web3.utils.toWei("40", "ether");
//         let initBalance = await web3.eth.getBalance(account)/1e18;
//         await xbotInstance.buy(nullAddress, 1, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
//         await xbotInstance.buy(nullAddress, 1, {from: account, value: amountEthBuy});    
// //         await xbotInstance.exit({from: account});
//         await xbotInstance.exit({from: accounts[1]});

//         let balanceETH = await web3.eth.getBalance(accounts[1])/1e18;
//         console.log("balanceETH0:", balanceETH);

//         assert.equal(initBalance - 20*14/100, balanceETH, "error");
//    });

    // it("should sell balance when amount token sell greater balance", async () => {
    //     let account = accounts[0];
    //     let amountEthBuy = web3.utils.toWei("40", "ether");

    //     await xbotInstance.buy(account, 1, {from: account, value: amountEthBuy});  
    //     let balanceToken = await xbotInstance.balanceOf(account);
    //     let amountTokenIn = balanceToken + 1e18;
        
    //     await xbotInstance.sell(amountTokenIn, 1);
    //     let balanceToken1 = await xbotInstance.balanceOf(account);
    //     console.log("🚀 ~ file: XBOT.js:195 ~ it ~ balanceToken1:", Number(balanceToken1))
        
    //     assert.equal(Number(balanceToken1), 0, "error");
    // });

    // it("should return true when transfer token", async () => {
    //     let account_0 = accounts[0];
    //     let account_1 = accounts[1];
    //     let amountEthBuy = web3.utils.toWei("1", "ether");

    //     await xbotInstance.buy(account_0, 1, {from: account_0, value: amountEthBuy});  

    //     let dividend_0 = await xbotInstance.dividendsOf(account_0);
    //     console.log("🚀 ~ dividend_account_0:", dividend_0.toString() / 1e18);

    //     let balance_0 = await xbotInstance.balanceOf(account_0);
    //     console.log("🚀 ~ balance_account_0:", balance_0.toString() / 1e18);

    //     await xbotInstance.transfer(account_1, BigInt(100e18),  {from: account_0});

    //     let balance_account_0 = await xbotInstance.balanceOf(account_0);
    //     console.log("🚀 balance_account_0 after transferFrom:", balance_account_0.toString() / 1e18);

    //     let dividend_1 = await xbotInstance.dividendsOf(account_0);
    //     console.log("🚀 ~ dividend_account_0 after transferFrom:", dividend_1.toString() / 1e18);

    //     let balance_account_1 = await xbotInstance.balanceOf(account_1);
    //     console.log("🚀 balance_account_1 after transferFrom:", balance_account_1.toString() / 1e18)
    // });

    // it("should return true when transferFrom token", async () => {
    //     let account_0 = accounts[0];
    //     let account_1 = accounts[1];
    //     let amountEthBuy = web3.utils.toWei("10", "ether");
    //     await xbotInstance.buy(account_0, 1, {from: account_0, value: amountEthBuy});  

    //     let dividend_0 = await xbotInstance.dividendsOf(account_0);
    //     console.log("🚀 ~ dividend_account_0:", dividend_0.toString() / 1e18);

    //     let balance_0 = await xbotInstance.balanceOf(account_0);
    //     console.log("🚀 ~ balance_account_0:", balance_0.toString() / 1e18);

    //     console.log("account 0 approve account 1");
    //     await xbotInstance.approve(account_1, BigInt(1000000000e18));

    //     let allowance = await xbotInstance.allowance(account_0, account_1);
    //     console.log("🚀 ~ allowance:", allowance.toString() / 1e18)

    //     console.log("account 1 call transferFrom");

    //     await xbotInstance.transferFrom(account_0, account_1, BigInt(100e18), {from: account_1});

    //     let dividend_1 = await xbotInstance.dividendsOf(account_0);
    //     console.log("🚀 ~ dividend_account_0 after transferFrom:", dividend_1.toString() / 1e18);

    //     let balance_account_0 = await xbotInstance.balanceOf(account_0);
    //     console.log("🚀 balance_account_0 after transferFrom:", balance_account_0.toString() / 1e18)

    //     let balance_account_1 = await xbotInstance.balanceOf(account_1);
    //     console.log("🚀 balance_account_1 after transferFrom:", balance_account_1.toString() / 1e18)
    // });

    // it("Should return true if contract call transferFrom", async() => {
    //     const testInstance = await test.new();

    //     let account_0 = accounts[0];
    //     let account_1 = accounts[1];

    //     let amountEthBuy = web3.utils.toWei("10", "ether");
    //     await xbotInstance.buy(account_0, 1, {from: account_0, value: amountEthBuy});  

    //     let balance_account_0_befor_deposit = await xbotInstance.balanceOf(account_0);
    //     console.log("🚀 ~ balance_account_0_befor_deposit:", balance_account_0_befor_deposit.toString() / 1e18)

    //     let dividend_account_0_befor_deposit = await xbotInstance.dividendsOf(account_0);
    //     console.log("🚀 ~ dividend_account_0_befor_deposit:", dividend_account_0_befor_deposit.toString() / 1e18)

    //     let balance_account_1_befor_deposit = await xbotInstance.balanceOf(account_1);
    //     console.log("🚀 ~ balance_account_1_befor_deposit:", balance_account_1_befor_deposit.toString() / 1e18)

    //     console.log("account 0 approve contract test");
    //     await xbotInstance.approve(testInstance.address, BigInt(1000000000e18));

    //     await testInstance.deposit(xbotInstance.address, account_0, testInstance.address, BigInt(100e18));

    //     let dividend_account_0_after_deposit = await xbotInstance.dividendsOf(account_0);
    //     console.log("🚀 ~ dividend_account_0_after_deposit:", dividend_account_0_after_deposit.toString() / 1e18)

    //     let balance_account_0_after_deposit = await xbotInstance.balanceOf(account_0);
    //     console.log("🚀 ~ balance_account_0_after_deposit:", balance_account_0_after_deposit.toString() / 1e18)

    //     let balance_account_1_after_deposit = await xbotInstance.balanceOf(testInstance.address);
    //     console.log("🚀 ~ balance_account_1_after_deposit:", balance_account_1_after_deposit.toString() / 1e18)

    // })

    // it("should return true if transfer ETH XBOTTreasury", async() => {
    //     let amountEth = web3.utils.toWei("10", "ether");

    //     await web3.eth.sendTransaction({
    //         from: accounts[1], // Sender's account
    //         to: XBOTTreasuryInstance.address, // Contract's address
    //         value: amountEth , // Amount in wei
    //     });

    //     let balanceETHContract = await web3.eth.getBalance(XBOTTreasuryInstance.address);
    //     console.log("🚀 ~ balanceETHContract:", balanceETHContract);

    //     await XBOTTreasuryInstance.withdraw({from: accounts[0]});

    //     let balanceETHContract1 = await web3.eth.getBalance(XBOTTreasuryInstance.address);
    //     console.log("🚀 ~ balanceETHContract1:", balanceETHContract1);

    //     let balanceETHOwner = await web3.eth.getBalance(accounts[0]);
    //     console.log("🚀 ~ balanceETHOwner:", balanceETHOwner / 1e18);
    // })

    // it("check balance after buy" , async() => {
    //     let amountEth = web3.utils.toWei("10", "ether");
    //     let getMinTokenOut = await xbotInstance.getAmountOut(amountEth, nullAddress);
    //     await xbotInstance.buy(nullAddress, getMinTokenOut,{ from: accounts[0], value: amountEth});
    //     let balanceUser = await xbotInstance.balanceOf(accounts[0]);

    //     assert.equal(getMinTokenOut.toString(), balanceUser.toString(), "error");
    // })

    // it("check ratio balance eth after buy, sell, referral sender" , async() => {
    //     let amountEth = web3.utils.toWei("50", "ether");

    //     for(let i = 0 ; i < 10; i++) {
    //         let getMinTokenOut = await xbotInstance.getAmountOut(amountEth, nullAddress);
    //         await xbotInstance.buy(nullAddress, getMinTokenOut,{ from: accounts[i], value: amountEth});
    //     }
    //     console.log();

    //     for(let i = 0 ; i < 10; i++) {
    
    //         await xbotInstance.exit({ from: accounts[i]});
            
    //         let balanceEthUser = await web3.eth.getBalance(accounts[i]);
    //         console.log(`🚀 ~ balanceEthUser${i}:`, balanceEthUser.toString() / 1e18)
    //     }

    //     let balanceEthContract = await xbotInstance.getETHBalance();
    //     console.log("🚀 ~ balanceEthContract:", balanceEthContract.toString() / 1e18)
    // })

    // it("check ratio balance eth after buy, sell, referral 0x0" , async() => {
    //     let amountEth = web3.utils.toWei("50", "ether");

    //     let getMinTokenOut = await xbotInstance.getAmountOut(amountEth, nullAddress);
    //     await xbotInstance.buy(nullAddress, getMinTokenOut,{ from: accounts[0], value: amountEth});
    //     let bananceOf = await xbotInstance.balanceOf(accounts[0]);
    //     let ethSellAll = await xbotInstance.getAmountOut(bananceOf, xbotInstance.address);
        
    //     let estimateEthOut = (Number(ethSellAll) + Number(amountEth) + Number(amountEth * 10 / 100));

    //     await xbotInstance.exit({ from: accounts[0]});
    //     let ethBalanceAfterExit = await web3.eth.getBalance(accounts[0]);

    //     let ratio = ethBalanceAfterExit * 100 / estimateEthOut;

    //     if(ratio >= 99.95){
    //         assert.equal(1,1, "Error");
    //     } else {
    //         assert.equal(1,2, "Error");
    //     }
    // })

    // it("test, referral 0x0" , async() => {
    //     let amountEth = web3.utils.toWei("50", "ether");

    //     for (let index = 0; index < 4; index++) {
    //         await xbotInstance.buy(nullAddress, 0,{ from: accounts[index], value: amountEth});
    //     }
    //     const balanceEthContract = await xbotInstance.getETHBalance();
    //     console.log("🚀 ~ balanceEthContract:", balanceEthContract.toString() / 1e18, "ETH");
    //     const price =  await xbotInstance.buyPrice();
    //     console.log("🚀 ~ price:", price.toString() / 1e18, "ETH");
    //     const totalSupply = await xbotInstance.totalSupply()
    //     console.log("🚀 ~ file: XBOT.js:377 ~ it ~ totalSupply:", totalSupply.toString() / 1e18)
        
    // })

    // it("should return referral", async () => {
    //     console.log("owner buy 1 ETH");
    //     await xbotInstance.buy(nullAddress, 1, {from: accounts[0], value: web3.utils.toWei("1", "ether")});

    //     let _51TokenToEth = await xbotInstance.getAmountIn(web3.utils.toWei("51", "ether"), xbotInstance.address);
    //     console.log("🚀 ~  _50TokenToEth:", _51TokenToEth.toString() / 1e18);
    //     console.log();

    //     console.log("account 1 buy ", _51TokenToEth.toString() / 1e18, "ETH");
    //     await xbotInstance.buy(nullAddress, 1, {from: accounts[1], value: _51TokenToEth});
    //     let balanceAccount1 = await xbotInstance.balanceOf(accounts[1]);
    //     console.log("🚀 ~ balanceAccount1:", balanceAccount1.toString() / 1e18);
    //     let dividendAccount1 = await xbotInstance.myDividends(true, accounts[1]);
    //     console.log("🚀 ~ dividendAccount1:", dividendAccount1.toString() / 1e18);
    //     console.log();

    //     const referralCodeByAccount1 = web3.utils.asciiToHex("account1");
    //     console.log("🚀 ~ referralCodeByAccount1:", referralCodeByAccount1)
    //     console.log("account 1 setReferralCode");
    //     await ReferralInstance.setReferralCode(referralCodeByAccount1, {from: accounts[1]});
    //     console.log();

    //     console.log("account 2 buy 10 ETH, refarral code of account 1");
    //     await xbotInstance.buy(referralCodeByAccount1, 1, {from: accounts[2], value: web3.utils.toWei("10", "ether")});
    //     let dividendAccount1AfterAccount2Buy10Eth = await xbotInstance.myDividends(true, accounts[1]);
    //     console.log("🚀 ~ dividendAccount1AfterAccount2Buy10Eth:", dividendAccount1AfterAccount2Buy10Eth.toString() / 1e18);

    //     let bonusReferral = dividendAccount1AfterAccount2Buy10Eth - dividendAccount1;
    //     console.log("🚀 ~ bonusReferral:", bonusReferral.toString() / 1e18);

    //     console.log("account 1 exit");
    //     await xbotInstance.exit({from: accounts[1]});
        
    //     let balanceEthAccount1 = await web3.eth.getBalance(accounts[1]);
    //     console.log("🚀 ~ balanceEthAccount1:", balanceEthAccount1.toString() / 1e18)
    // })

})