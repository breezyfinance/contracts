const BreezyFarmBREWETH = artifacts.require("BreezyFarmBREWETH");
const BreezyMining = artifacts.require("BreezyMining");
const holdBRE = artifacts.require("holdBRE");
const CustomERC20Mintable = artifacts.require("CustomERC20Mintable");

module.exports = async function(deployer, network, accounts) {
  
  // Deploy holdBRE contract with max supply of 21,000,000 in 18 decimals
  const maxSupply = web3.utils.toWei('21000000', 'ether');
  await deployer.deploy(holdBRE, maxSupply);
  const holdBREInstance = await holdBRE.deployed();

  // Deploy BreezyMining contract
  await deployer.deploy(BreezyMining, holdBREInstance.address, 1);
  const breezyMiningInstance = await BreezyMining.deployed();
  
  // Allow the BreezyMining contract to mint holdBRE tokens
  await holdBREInstance.setMiningMachine(breezyMiningInstance.address);

  // Deploy and initialize CustomERC20Mintable with the name "TestLP"
  await deployer.deploy(CustomERC20Mintable, "TestLP", "TLP", 18);
  const customERC20MintableInstance = await CustomERC20Mintable.deployed();

  // Mint tokens to 3 specific addresses
  const mintAmount = web3.utils.toWei('1000', 'ether');
  const addresses = [
    '0x632414bbF1C1DE108Aec3Ff3B716ace89e582063',
    '0xAE19b07452C1Afe9d9C30474b462873C99674b72',
    '0x54bed6f7bf4b555183d0a6c583B63F8E60ccbE68'
  ];
  for (const address of addresses) {
    await customERC20MintableInstance.mint(address, mintAmount);
  }

  // Fetch the poolLength as it will be the pid for the new pool
  const poolLength = await breezyMiningInstance.poolLength();
  const newPid = poolLength.toNumber();

  // totalAllocPoint is 1000, as you've specified
  const totalAllocPoint = 1000;

  // Set allocPoint for the farm to be 50% of totalAllocPoint
  const farmAllocPoint = totalAllocPoint / 2;

  // Deploy BreezyFarmBREWETH contract with the newPid
  await deployer.deploy(BreezyFarmBREWETH, breezyMiningInstance.address, customERC20MintableInstance.address, newPid);

  // Fetch instance of the newly deployed BreezyFarmBREWETH
  const breezyFarmBREWETHInstance = await BreezyFarmBREWETH.deployed();
  
  // Add the new pool in BreezyMining with the correct arguments
  await breezyMiningInstance.addPool(farmAllocPoint, breezyFarmBREWETHInstance.address);
};
