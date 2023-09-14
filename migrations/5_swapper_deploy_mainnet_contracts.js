const BreezySwapper = artifacts.require("BreezySwapper");
const IBreezySwapV1BREWETH = artifacts.require("IBreezySwapV1BREWETH");

module.exports = async function (deployer, network, accounts) {
//  // Deploy the BreezySwapper contract
//  await deployer.deploy(BreezySwapper);
//  const breezySwapper = await BreezySwapper.deployed();
//
//  // Define the pairs (replace with actual pair contract addresses)
//  const pairs = [
//    "0xd45a223a66f4b291745370e16712aebc5914baec",
//    "0xb9ac04eada919e6768fda40f2e8b31cc22b92a3d",
//    "0x77ade18b0f44579a83a1832a9162bf975b0de5d9,"
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
