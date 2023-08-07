
const BRE = artifacts.require("BRE");
const BreezyGateKeeper = artifacts.require("BreezyGateKeeper");

module.exports = function(deployer) {
    deployer.deploy(BRE, "21000000000000000000000000", "21000000000000000000000000").then(function() {
    });
    deployer.deploy(BreezyGateKeeper, 1, [""], [""], "");
};
