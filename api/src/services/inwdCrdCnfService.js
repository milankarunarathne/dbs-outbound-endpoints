const fs = require('fs');
const _ = require('lodash');
const openpgp = require('openpgp');
const path = require('path');
const constants = require('../constants');

class InwdCrdCnfService {
  constructor() {}

  async inwardCreditConfirmation(encReqBody) {
    const paymentTypeCodetoPaymentType = {
      'INCOMING ACT': 'ACT',
      'INCOMING TT': 'TT',
      'INCOMING RTGS': 'RTGS',
      'NEFT PAYMENT': 'NEFT',
      'MOBILE COLLECTION': 'IMPS',
      MISCELLANEOUS: 'ALL',
    };

    let transactionType = null;
    let paymentType = null;

    const publicKeyArmored = fs.readFileSync(path.join(__dirname, '../../../keys/senders-publicKey.asc'));
    const privateKeyArmored = fs.readFileSync(path.join(__dirname, '../../../keys/recievers-privateKey.asc'));
    const passphrase = ``;
    const {
      keys: [privateKey],
    } = await openpgp.key.readArmored(privateKeyArmored);
    const { data: reqBodyStr } = await openpgp.decrypt({
      message: await openpgp.message.readArmored(encReqBody), // parse armored message
      publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys, // for verification (optional)
      privateKeys: [privateKey], // for decryption
    });

    const reqBody = JSON.parse(reqBodyStr);

    if (_.isEmpty(reqBody)) {
      return {
        status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
        body: 'Data missed on request body',
      };
    }

    if (!_.isEmpty(_.filter(reqBody, ['txnType', 'IUPI']))) {
      transactionType = reqBody.txnInfo.txnType;
      paymentType = 'UPI';
      try {
        let currentTime = new Date().toISOString();
        fs.writeFileSync(`../public/${paymentType}-${transactionType}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
        return {
          status: constants.HTTP_STATUS_CODES.OK,
          body: 'Success',
        };
      } catch (e) {
        console.error(e.message);
        return {
          status: constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          body: 'Internal Server Error',
        };
      }
    }

    if (!_.isEmpty(_.find(reqBody, 'txnType'))) {
      transactionType = reqBody.txnInfo.txnType;
      paymentType = _.isUndefined(paymentTypeCodetoPaymentType[transactionType]) ? 'OTHER' : paymentTypeCodetoPaymentType[transactionType];
      try {
        let currentTime = new Date().toISOString();
        fs.writeFileSync(`../public/${paymentType}-${transactionType}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
        return {
          status: constants.HTTP_STATUS_CODES.OK,
          body: 'Success',
        };
      } catch (e) {
        console.error(e.message);
        return {
          status: constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          body: 'Internal Server Error',
        };
      }
    }
  }
}

module.exports = InwdCrdCnfService;
