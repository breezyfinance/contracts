const BreezyFarm = artifacts.require("BreezyFarm");
const BreezyMining = artifacts.require("BreezyMining");
const holdBRE = artifacts.require("holdBRE");
const CustomERC20Mintable = artifacts.require("CustomERC20Mintable");

module.exports = async function(deployer, network, accounts) {
  
  // Step 1: Deploy holdBRE contract
  const maxSupply = web3.utils.toWei('21000000', 'ether');
  await deployer.deploy(holdBRE, maxSupply);
  const holdBREInstance = await holdBRE.deployed();

  // Step 2: Deploy BreezyMining contract with holdBRE
  await deployer.deploy(BreezyMining, holdBREInstance.address, 1);
  const breezyMiningInstance = await BreezyMining.deployed();

  // Step 3: Set BreezyMining contract to holdBRE
  await holdBREInstance.setMiningMachine(breezyMiningInstance.address);

  // Define common variables
  const mintAmount = web3.utils.toWei('1000', 'ether');
  const addresses = [
    '0x632414bbF1C1DE108Aec3Ff3B716ace89e582063',
    '0xAE19b07452C1Afe9d9C30474b462873C99674b72',
    '0xA5c95fDDb15eEf6F0e1931Dc83182078Dc6C4654'
  ];

  // Step 4: Deploy Test LP1 and Step 5: Mint for addresses LP1
  const customERC20MintableInstance1 = await deployAndMintToken("TestLP1", "TLP1", addresses, mintAmount);

  // Step 6: Deploy Test LP2 and Step 7: Mint for addresses LP2
  const customERC20MintableInstance2 = await deployAndMintToken("TestLP2", "TLP2", addresses, mintAmount);

  // Step 8: Get pid and deploy farm 1 for LP1, add pool for farm 1 into mining contract
  await deployFarmAndAddPool(breezyMiningInstance, customERC20MintableInstance1);

  // Step 9: Get pid and deploy farm 2 for LP2, add pool for farm 2 into mining contract
  await deployFarmAndAddPool(breezyMiningInstance, customERC20MintableInstance2);

  // Helper function to deploy and mint tokens
  async function deployAndMintToken(name, symbol, addresses, mintAmount) {
    await deployer.deploy(CustomERC20Mintable, name, symbol, 18);
    const tokenInstance = await CustomERC20Mintable.deployed();
    for (const address of addresses) {
      await tokenInstance.mint(address, mintAmount);
    }
    return tokenInstance;
  }

  // Helper function to deploy farm and add pool
  async function deployFarmAndAddPool(breezyMiningInstance, lpTokenInstance) {
    const poolLength = await breezyMiningInstance.poolLength();
    const newPid = poolLength.toNumber();
    await deployer.deploy(BreezyFarm, breezyMiningInstance.address, lpTokenInstance.address, newPid);
    const farmInstance = await BreezyFarm.deployed();
    const farmAllocPoint = 500; // 50% of totalAllocPoint (1000)
    await breezyMiningInstance.addPool(farmAllocPoint, farmInstance.address);
  }
};
