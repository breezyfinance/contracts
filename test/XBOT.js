const XBOT = artifacts.require("XBOT");

contract("XBOT", accounts => {
    it("should allow users to buy tokens", async () => {
        const xbotInstance = await XBOT.new();

        // for (let i = 0; i < 10; i++) {
        //     console.log(`account[${i}]: ${accounts[i]}`);
        //     let cal = parseFloat((Math.random() * (2 - 0.00001) + 0.00001)).toFixed(18);
        //     let etherAmount = web3.utils.toWei(cal.toString(), "ether");
        //     console.log("🚀 etherAmount:", etherAmount/1e18, "ETH");
        //     await xbotInstance.buy(accounts[i], { from: accounts[i], value: etherAmount});
        //     const test = await xbotInstance.test();
        //     console.log("🚀 Fee:", test.toString())
        //     const totalSupply = await xbotInstance.totalSupply();
        //     console.log("🚀 totalSupply:", totalSupply.toString() / 1e18, "XBOT");
        // }

        let etherAmount = ["0.29908454661850903", "0.9722593862812304", "1.23123"];

        for (let i = 0; i < etherAmount.length; i++) {
            let amount = web3.utils.toWei(etherAmount[i], "ether");
            console.log("🚀 ~ file: XBOT.js:22 ~ it ~ etherAmount:", amount);
            await xbotInstance.buy(accounts[i], { from: accounts[i], value: amount});
            const test = await xbotInstance.test();
            console.log("🚀 ~ file: XBOT.js:25 ~ it ~ Fee:", test.toString());
            const totalSupply = await xbotInstance.totalSupply();
            console.log("🚀 ~ file: XBOT.js:27 ~ it ~ totalSupply:", totalSupply.toString());
            const profitPerShare = await xbotInstance.profitPerShare_();
            console.log("🚀 ~ file: XBOT.js:29 ~ it ~ profitPerShare:", profitPerShare.toString());
            console.log();
        }
    });
})