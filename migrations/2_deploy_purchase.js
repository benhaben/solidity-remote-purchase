const purchase = artifacts.require("../contracts/Purchase.sol");

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(purchase);
    console.log(`Deployment of data contracts completed`);
}
