//var artifacts = require('truffle-artifactor');
const Meme = artifacts.require("Meme");

module.exports = function(deployer) {
  deployer.deploy(Meme);
};
