const fs = require("fs");
const _ = require("lodash");
const openpgp = require("openpgp");
const path = require("path");
const constants = require("../constants");

class ACK2andACK3Service {
  constructor() {}

  async dummyget() {
    return {
      status: constants.HTTP_STATUS_CODES.OK,
      body: "Request is success",
    };
  }

  async ack2andack3(encReqBody) {
    let paymentType = null;
    let transactionStatus = null;
    let ack = null;
    let reqBodyStr = null;

    const publicKeyArmored = fs.readFileSync(path.join(__dirname, "../../../keys/senders-publicKey.asc"));
    const privateKeyArmored = fs.readFileSync(path.join(__dirname, "../../../keys/recievers-privateKey.asc"));
    const passphrase = ``;
    const {
      keys: [privateKey],
    } = await openpgp.key.readArmored(privateKeyArmored);

    try {
      reqBodyStr = await openpgp.decrypt({
        message: await openpgp.message.readArmored(encReqBody), // parse armored message
        publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys, // for verification (optional)
        privateKeys: [privateKey], // for decryption
      });
    } catch (error) {
      console.error("Error: ", error.message);
      if (error.message === "Misformed armored text") {
        return {
          status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
          body: "Please send encrypted request body",
        };
      }
      return {
        status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
        body: "Bad Request",
      };
    }

    const reqBody = JSON.parse(reqBodyStr.data);
    if (_.isEmpty(reqBody)) {
      return {
        status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
        body: "Data missed on request body",
      };
    }

    if (!_.isEmpty(_.filter(reqBody, ["txnType", "PUPI"]))) {
      transactionStatus = reqBody.txnResponse.txnStatus;
      ack = "ACK2";
      paymentType = "UPI";
      try {
        let currentTime = new Date().toISOString();
        fs.writeFileSync(`../public/${paymentType}-${ack}-${transactionStatus}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
        return {
          status: constants.HTTP_STATUS_CODES.OK,
          body: "Success",
        };
      } catch (e) {
        console.error(e.message);
        return {
          status: constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          body: "Internal Server Error",
        };
      }
    }

    if (!_.isEmpty(_.filter(reqBody, ["txnType", "IMPS"])) || !_.isEmpty(_.filter(reqBody, ["txnType", "OIMPS"]))) {
      transactionStatus = reqBody.txnResponse.txnStatus;
      ack = reqBody.txnResponse.responseType;
      paymentType = "IMPS";
      try {
        let currentTime = new Date().toISOString();
        fs.writeFileSync(`../public/${paymentType}-${ack}-${transactionStatus}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
        return {
          status: constants.HTTP_STATUS_CODES.OK,
          body: "Success",
        };
      } catch (e) {
        console.error(e.message);
        return {
          status: constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          body: "Internal Server Error",
        };
      }
    }

    if (!_.isEmpty(_.filter(reqBody.txnResponses, ["txnType", "RTGS"]))) {
      let transactionResponse = _.filter(reqBody.txnResponses, ["txnType", "RTGS"])[0];
      transactionStatus = _.get(transactionResponse, "txnStatus");
      ack = _.get(transactionResponse, "responseType");
      paymentType = "RTGS";
      try {
        let currentTime = new Date().toISOString();
        fs.writeFileSync(`../public/${paymentType}-${ack}-${transactionStatus}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
        return {
          status: constants.HTTP_STATUS_CODES.OK,
          body: "Success",
        };
      } catch (e) {
        console.error(e.message);
        return {
          status: constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          body: "Internal Server Error",
        };
      }
    }

    if (!_.isEmpty(_.filter(reqBody.batchResponse, ["txnType", "BPY"]))) {
      ack = _.get(reqBody.header, "responseType");
      transactionStatus = _.get(reqBody.header, "msgStatus");
      paymentType = "NEFT";
      try {
        let currentTime = new Date().toISOString();
        fs.writeFileSync(`../public/${paymentType}-${ack}-${transactionStatus}-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
        return {
          status: constants.HTTP_STATUS_CODES.OK,
          body: "Success",
        };
      } catch (e) {
        console.error(e.message);
        return {
          status: constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          body: "Internal Server Error",
        };
      }
    }

    try {
      let currentTime = new Date().toISOString();
      fs.writeFileSync(`../public/Different-Response-Type-${currentTime}.txt`, JSON.stringify(reqBody), (err) => {});
      return {
        status: constants.HTTP_STATUS_CODES.OK,
        body: "Success",
      };
    } catch (e) {
      console.error(e.message);
      return {
        status: constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        body: "Internal Server Error",
      };
    }
  }
}

module.exports = ACK2andACK3Service;
