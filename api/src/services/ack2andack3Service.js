const _ = require('lodash');
const fs = require('fs');
const constants = require('../constants');

class ACK2andACK3Service {
  constructor() {}

  async ack2andack3(reqBody) {
    let paymentType = null;
    let transactionStatus = null;
    let ack = null;

    if (_.isEmpty(reqBody)) {
      return {
        status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
        body: 'Data missed on request body',
      };
    }

    if (!_.isEmpty(_.filter(reqBody, ['txnType', 'PUPI']))) {
      transactionStatus = reqBody.txnResponse.txnStatus;
      ack = 'ACK2';
      paymentType = 'UPI';
      try {
        let currentTime = new Date().toISOString();
        fs.writeFileSync(`../public/${paymentType}-${ack}-${transactionStatus}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
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

    if (!_.isEmpty(_.filter(reqBody, ['txnType', 'IMPS'])) || !_.isEmpty(_.filter(reqBody, ['txnType', 'OIMPS']))) {
      transactionStatus = reqBody.txnResponse.txnStatus;
      ack = reqBody.txnResponse.responseType;
      paymentType = 'IMPS';
      try {
        let currentTime = new Date().toISOString();
        fs.writeFileSync(`../public/${paymentType}-${ack}-${transactionStatus}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
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

    if (!_.isEmpty(_.filter(reqBody.txnResponses, ['txnType', 'RTGS']))) {
      let transactionResponse = _.filter(reqBody.txnResponses, ['txnType', 'RTGS'])[0];
      transactionStatus = _.get(transactionResponse, 'txnStatus');
      ack = _.get(transactionResponse, 'responseType');
      paymentType = 'RTGS';
      try {
        let currentTime = new Date().toISOString();
        fs.writeFileSync(`../public/${paymentType}-${ack}-${transactionStatus}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
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

    if (!_.isEmpty(_.filter(reqBody.batchResponse, ['txnType', 'BPY']))) {
      ack = _.get(reqBody.header, 'responseType');
      transactionStatus = _.get(reqBody.header, 'msgStatus');
      paymentType = 'NEFT';
      try {
        let currentTime = new Date().toISOString();
        fs.writeFileSync(`../public/${paymentType}-${ack}-${transactionStatus}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
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

    try {
      fs.writeFileSync(`../public/${paymentType}-${ack}-${transactionStatus}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
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

module.exports = ACK2andACK3Service;
