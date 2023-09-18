const XBOT = artifacts.require("XBOT");

contract("XBOT", accounts => {
    it("should allow users to buy tokens", async () => {
        const xbotInstance = await XBOT.new();

        const buyer = accounts[1];
        const etherAmount = web3.utils.toWei("0.1", "ether"); // 0.1 ETH

        await xbotInstance.buy(buyer, { from: buyer, value: etherAmount });

        const getPayout = await xbotInstance.payoutsTo_.call(buyer);
        console.log("🚀 ~ file: XBOT.js:16 ~ it ~ getPayout:", getPayout.toString())
        // const finalBalance = await xbotInstance.balanceOf(buyer);

        // Add your assertions here to check if the token balance has increased correctly.
        // You can compare initialBalance and finalBalance to check this.

        // For example:
        // assert.isTrue(finalBalance > initialBalance);
    });
})