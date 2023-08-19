const BreezySwapper = artifacts.require("BreezySwapper");
const IBreezySwapV1BREWETH = artifacts.require("IBreezySwapV1BREWETH");

module.exports = async function (deployer, network, accounts) {
//  // Deploy the BreezySwapper contract
//  await deployer.deploy(BreezySwapper);
//  const breezySwapper = await BreezySwapper.deployed();
//
//  // Define the pairs (replace with actual pair contract addresses)
//  const pairs = [
//    "0xbcf0cc1e8bdece008a7f4958c4d2c06af4b8d59f",
//    "0xb44653e1791aa84f42b6fd6eb3a0080896f54ca2",
//    "0x5dd76bf5a9889b21d72971b434f74fc2b8ff2286",
//    // Add more pairs as needed
//  ];
//
//  // Iterate through the pairs and call approveWithPair for both base and trade tokens
//  for (const pairAddress of pairs) {
//    const pairInstance = await IBreezySwapV1BREWETH.at(pairAddress);
//    const baseToken = await pairInstance.base();
//    const tradeToken = await pairInstance.token();
//
//    await breezySwapper.approveWithPair(baseToken, pairAddress);
//    await breezySwapper.approveWithPair(tradeToken, pairAddress);
//  }
};
