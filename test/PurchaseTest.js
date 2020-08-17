const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();
const {
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const DateLibraryFactory = artifacts.require("DateLibrary");


contract('DateLibraryFactory', function () {

  beforeEach(async function () {
  });

  describe('#addMonth', () => {
    it('should successfully add month', async () => {
      const months = await dateLibrary.addMonths(201910, 1);
      months.toNumber().should.be.equal(201911);
      {
        const months = await dateLibrary.addMonths(201912, 1);
        months.toNumber().should.be.equal(202001);
      }
      {
        const months = await dateLibrary.addMonths(201901, 12);
        months.toNumber().should.be.equal(202001);
      }
      {
        const months = await dateLibrary.addMonths(201905, 10);
        months.toNumber().should.be.equal(202003);
      }
    });

    it('reverts when input yearMonth 0', async () => {
      await expectRevert.unspecified(
        dateLibrary.addMonths(0, 1)
      );
    });

    it('reverts when input yearMonth 210001', async () => {
      await expectRevert.unspecified(
        dateLibrary.addMonths(210001, 1)
      );
    });
  });

  
});
