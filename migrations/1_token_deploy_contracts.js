
const BRE = artifacts.require("BRE");
const BreezyGateKeeper = artifacts.require("BreezyGateKeeper");
const BreezyAirdropAndDevFund = artifacts.require("BreezyAirdropAndDevFund");
const BreezyFarmingFund = artifacts.require("BreezyFarmingFund");
const BreezyNFTLPLock = artifacts.require("BreezyNFTLPLock");
const XBOT = artifacts.require("XBOT");
const XBOTTreasury = artifacts.require("XBOTTreasury");


module.exports = function(deployer) {
//    deployer.deploy(BRE, "21000000000000000000000000", "21000000000000000000000000").then(function() {
//    });
//    deployer.deploy(BreezyGateKeeper, 86400, ["0x973fc364a5fB9E340084a3D901F2E09c3Cc6328D"], ["0x973fc364a5fB9E340084a3D901F2E09c3Cc6328D"], "0x973fc364a5fB9E340084a3D901F2E09c3Cc6328D");
//    deployer.deploy(BreezyAirdropAndDevFund);
//    deployer.deploy(BreezyFarmingFund);
//    deployer.deploy(BreezyNFTLPLock);
    deployer.deploy(XBOT);
    deployer.deploy(XBOTTreasury);
};
