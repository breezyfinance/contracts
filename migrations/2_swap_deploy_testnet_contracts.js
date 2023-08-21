const CustomERC20Mintable = artifacts.require("CustomERC20Mintable");
const BreezyWhitelist = artifacts.require("BreezyWhitelist");
const BreezySwapV1BREWETH = artifacts.require("BreezySwapV1BREWETH");

const baseDecimals = 18;
const tradeDecimals = 18;

module.exports = async function (deployer) {
//    await deployer.deploy(CustomERC20Mintable, "Wrapped Ether", "WETH", baseDecimals);
//    const tokenA = await CustomERC20Mintable.deployed();
//    const tokenA = await CustomERC20Mintable.at("0x8114b91c6ae47d1679b7a32caeca473cbab9c14a");
//
//    await deployer.deploy(CustomERC20Mintable, "Dai Stablecoin", "DAI", tradeDecimals);
//    const tokenB = await CustomERC20Mintable.deployed();
//
//    await deployer.deploy(BreezyWhitelist);
//    const whitelist = await BreezyWhitelist.deployed();
//
//    // Define recipients and amounts (update as needed)
//    const recipients = [
//        { address: "0x632414bbF1C1DE108Aec3Ff3B716ace89e582063", amountA: web3.utils.toBN('500').mul(web3.utils.toBN(10**baseDecimals)), amountB: web3.utils.toBN('600').mul(web3.utils.toBN(10**tradeDecimals)) },
//        { address: "0xAE19b07452C1Afe9d9C30474b462873C99674b72", amountA: web3.utils.toBN('500').mul(web3.utils.toBN(10**baseDecimals)), amountB: web3.utils.toBN('600').mul(web3.utils.toBN(10**tradeDecimals)) },
//        { address: "0x54bed6f7bf4b555183d0a6c583B63F8E60ccbE68", amountA: web3.utils.toBN('500').mul(web3.utils.toBN(10**baseDecimals)), amountB: web3.utils.toBN('600').mul(web3.utils.toBN(10**tradeDecimals)) },
//        // Add more recipients as needed
//    ];
//
//    // Mint tokens for recipients
//    for (const recipient of recipients) {
//        await tokenA.mint(recipient.address, recipient.amountA);
//        await tokenB.mint(recipient.address, recipient.amountB);
//    }
//
//    const feeMachineContract = "0x632414bbF1C1DE108Aec3Ff3B716ace89e582063";
//    const name = "BreezyTokenLP";
//    const symbol = "BRZLP";
//
//    await deployer.deploy(
//            BreezySwapV1BREWETH,
//            tokenA.address,
//            tokenB.address,
//            feeMachineContract,
//            whitelist.address,
//            name,
//            symbol
//            );
//
//    const breezySwap = await BreezySwapV1BREWETH.deployed();
//
//    // Define parameters for addLP function (update as needed)
//    const minLP = web3.utils.toWei('1', 'ether');
//    const baseInputAmount = web3.utils.toBN('10').mul(web3.utils.toBN(10**baseDecimals));
//    const maxTokenInputAmount = web3.utils.toBN('5').mul(web3.utils.toBN(10**tradeDecimals));
//    const deadline = Math.floor(Date.now() / 1000) + 3600;
//
//    // Approve and add liquidity
//    await tokenA.approve(breezySwap.address, baseInputAmount);
//    await tokenB.approve(breezySwap.address, maxTokenInputAmount);
//    await breezySwap.addLP(minLP, baseInputAmount, maxTokenInputAmount, deadline);
};
