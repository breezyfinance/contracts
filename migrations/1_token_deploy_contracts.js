
const BRE = artifacts.require("BRE");
//const GRBProxy = artifacts.require("GRBProxy");

module.exports = function(deployer) {
    deployer.deploy(BRE, "21000000000000000000000000", "10000000000000000000000").then(function() {
        
    });
};
