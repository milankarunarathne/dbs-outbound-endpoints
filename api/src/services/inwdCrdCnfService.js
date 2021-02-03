const _ = require('lodash');
const fs = require('fs');
const constants = require('../constants');

class InwdCrdCnfService {
  constructor() {}

  async inwardCreditConfirmation(reqBody) {
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
