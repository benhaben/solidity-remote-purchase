const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();
const web3 = require('web3');
const {
    BN,
    ether,
    balance,
    expectRevert,
    expectEvent// Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const PurchaseFactory = artifacts.require("Purchase");
const tenEth = ether("10").toString();
const fiveEth = ether("5").toString();
const twentyEth = ether("20").toString();
const fifteen = ether("15").toString();
const Created = 0;
const Locked = 1;
const Inactive = 2;

contract('Purchase Contract', async accounts => {

    const testAccounts = {
        sellerAddress: accounts[0],
        buyerAddress: accounts[1],
        passerbyAddress: accounts[2]

    };

    beforeEach(async function () {
    });

    describe('#constructor', () => {
        it('should setup a production', async () => {
            const purchaseContract = await PurchaseFactory.new({from: testAccounts.sellerAddress, value: tenEth});
            const value = await purchaseContract.getValue();
            value.toString().should.be.equal(fiveEth);

            const state = await purchaseContract.getState();
            state.toNumber().should.be.equal(Created);
        });

    });

    describe('#abort', () => {
        let purchaseContract;
        beforeEach(async () => {
            purchaseContract = await PurchaseFactory.new({from: testAccounts.sellerAddress, value: tenEth});
        });
        it('should successfully abort if nobody buy', async () => {
            const result = await purchaseContract.abort();
            expectEvent.inLogs(result.logs, 'Aborted');
        });

        it('should not successfully abort if called by wrong account', async () => {
            const result = purchaseContract.abort({from: testAccounts.passerbyAddress});
            await expectRevert(result, "only seller");
        });

        //todo: test status
    });

    describe('#confirmPurchase', () => {
        let purchaseContract;

        beforeEach(async () => {
            purchaseContract = await PurchaseFactory.new({from: testAccounts.sellerAddress, value: tenEth});
        });

        it('should successfully confirm purchase', async () => {

            const result = await purchaseContract.confirmPurchase({from: testAccounts.buyerAddress, value: tenEth});
            expectEvent.inLogs(result.logs, 'PurchaseConfirmed');

            const value = await purchaseContract.getValue();
            value.toString().should.be.equal(fiveEth);

            // 检查合约总的余额
            (await balance.current(purchaseContract.address)).toString().should.to.be.equal(twentyEth);

            const state = await purchaseContract.getState();
            state.toNumber().should.be.equal(Locked);
        });

        it('should not successfully abort if value is wrong', async () => {
            const result = purchaseContract.confirmPurchase({from: testAccounts.sellerAddress, value: fiveEth});
            await expectRevert(result, "do not send right money");
        });

        //todo: test status
    });

    describe('#confirmReceived', () => {
        let purchaseContract;
        let sellerAddressEth;
        let buyerAddressEth;

        beforeEach(async () => {
            purchaseContract = await PurchaseFactory.new({from: testAccounts.sellerAddress, value: tenEth});
        });

        it('should successfully confirm received', async () => {

            await purchaseContract.confirmPurchase({from: testAccounts.buyerAddress, value: tenEth});
            const result = await purchaseContract.confirmReceived({from: testAccounts.buyerAddress});
            expectEvent.inLogs(result.logs, 'ItemReceived', {
                buyerReceivedValue: fiveEth,
                sellerReceivedValue: fifteen,
            });

            const state = await purchaseContract.getState();
            state.toNumber().should.be.equal(Inactive);
        });

    });
});
