const BreezyFarm = artifacts.require("BreezyFarm");
const BreezyMining = artifacts.require("BreezyMining");
const holdBRE = artifacts.require("holdBRE");
const CustomERC20Mintable = artifacts.require("CustomERC20Mintable");

module.exports = async function(deployer, network, accounts) {
  
//  // Step 1: Deploy holdBRE contract
//  const holdBREInstance = await holdBRE.at("0x3a6b857a847031eb18a05a2e207ac98f663bb18c");
//
//  // Step 2: Deploy BreezyMining contract with holdBRE
//  const breezyMiningInstance = await BreezyMining.at("0x62989ad9128049d03760d65bac7feb9fccb42ccf");
//
////  // Step 4: LP1
////  const customERC20MintableInstance1 = await CustomERC20Mintable.at("0xf5b45149aeba6c8353e152b05dc34b096b0acdae");
//
//  // Step 6: LP2
//  const customERC20MintableInstance2 = await CustomERC20Mintable.at("0xc56f985805e548b205c96271424a0db9d2e81c74");
//
////  // Step 8: Get pid and deploy farm 1 for LP1, add pool for farm 1 into mining contract
////  await deployFarmAndAddPool(breezyMiningInstance, customERC20MintableInstance1);
//
//  // Step 9: Get pid and deploy farm 2 for LP2, add pool for farm 2 into mining contract
//  await deployFarmAndAddPool(breezyMiningInstance, customERC20MintableInstance2);
//
//  // Helper function to deploy farm and add pool
//  async function deployFarmAndAddPool(breezyMiningInstance, lpTokenInstance) {
//    const poolLength = await breezyMiningInstance.poolLength();
//    const newPid = poolLength.toNumber();
//    await deployer.deploy(BreezyFarm, breezyMiningInstance.address, lpTokenInstance.address, newPid);
//    const farmInstance = await BreezyFarm.deployed();
//    const farmAllocPoint = 500; // 50% of totalAllocPoint (1000)
//    await breezyMiningInstance.addPool(farmAllocPoint, farmInstance.address);
//  }
};
