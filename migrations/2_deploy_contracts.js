var TokenA = artifacts.require("./TokenA.sol");
var TokenB = artifacts.require("./TokenA.sol");


module.exports = async function(deployer) {
    await deployer.deploy(TokenA, 1000000000);
    await deployer.deploy(TokenB, 1000000000);
};