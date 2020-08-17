const Migrations = artifacts.require("Migrations");

module.exports = async (deployer, network, accounts) => {
  console.log(`Using network: ${network}`);
  console.log(`Using accounts`, accounts);

  await deployer.deploy(Migrations);
};
