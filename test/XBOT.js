const XBOT = artifacts.require("XBOT");

contract("XBOT", accounts => {
    it("should allow users to buy tokens", async () => {
        const xbotInstance = await XBOT.new();

        for (let i = 0; i < 10; i++) {
            console.log(`account[${i}]: ${accounts[i]}`);
            let cal = parseFloat((Math.random() * (2 - 0.00001) + 0.00001)).toFixed(18);
            let etherAmount = web3.utils.toWei(cal.toString(), "ether");
            console.log("🚀 etherAmount:", etherAmount/1e18, "ETH");
            await xbotInstance.buy(accounts[i], { from: accounts[i], value: etherAmount});
            const test = await xbotInstance.test();
            console.log("Fee:", test.toString())
        }
    });
})