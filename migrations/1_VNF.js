const VNF = artifacts.require("VNF");

module.exports = function (deployer) {
  deployer.deploy(VNF);
};