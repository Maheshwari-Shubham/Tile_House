const test = require('node:test');
const assert = require('node:assert/strict');
const { isOfferDateValid } = require('../utils/offerValidation');

test('rejects past offer end dates and allows future ones', () => {
  assert.equal(isOfferDateValid('2020-01-01'), false);
  assert.equal(isOfferDateValid(new Date(Date.now() - 86400000).toISOString()), false);
  assert.equal(isOfferDateValid('2099-12-31'), true);
  assert.equal(isOfferDateValid(null), true);
});
