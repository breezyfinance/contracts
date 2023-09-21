const CustomERC20Mintable = artifacts.require("CustomERC20Mintable");
const BreezyWhitelist = artifacts.require("BreezyWhitelist");
const BreezySwapV1BREWETH = artifacts.require("BreezySwapV1BREWETH");

module.exports = async function (deployer) {

    const USDbC = await CustomERC20Mintable.at("0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA");
    const cbETH = await CustomERC20Mintable.at("0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22");
    const DAI = await CustomERC20Mintable.at("0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb");
    const WETH = await CustomERC20Mintable.at("0x4200000000000000000000000000000000000006");
    const BRE = await CustomERC20Mintable.at("0xfffb7488ab5ddde106b5bef56e7c179700509842");
    
//     const whitelist = await BreezyWhitelist.at("0x4ddbf9d95a1396642f973a8143baaa614e57c332");

//     const feeMachineContract = "0x973fc364a5fB9E340084a3D901F2E09c3Cc6328D";
//     const name = "BreezyTokenLP";
//     const symbol = "BRZLP";

// //    await deployer.deploy(
// //            BreezySwapV1BREWETH,
// //            WETH.address,
// //            USDbC.address,
// //            feeMachineContract,
// //            whitelist.address,
// //            name,
// //            symbol
// //            );
// //    
// //    await deployer.deploy(
// //            BreezySwapV1BREWETH,
// //            WETH.address,
// //            cbETH.address,
// //            feeMachineContract,
// //            whitelist.address,
// //            name,
// //            symbol
// //            );
    
//    await deployer.deploy(
//            BreezySwapV1BREWETH,
//            WETH.address,
//            BRE.address,
//            feeMachineContract,
//            whitelist.address,
//            name,
//            symbol
//            );
//    await deployer.deploy(
//            BreezySwapV1BREWETH,
//            cbETH.address,
//            BRE.address,
//            feeMachineContract,
//            whitelist.address,
//            name,
//            symbol
//            );
//     await deployer.deploy(
//             BreezySwapV1BREWETH,
//             WETH.address,
//             DAI.address,
//             feeMachineContract,
//             whitelist.address,
//             name,
//             symbol
//             );
};
