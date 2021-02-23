const express = require('express');
const ACK2andACK3Service = require('../services/ack2andack3Service');

const router = express.Router();

router.post('', async (req, res) => {
  const ack2andack3Service = new ACK2andACK3Service();
  const result = await ack2andack3Service.ack2andack3(req.body);
  res.status(result.status).send(result.body);
});

router.get('', async (req, res) => {
  const ack2andack3Service = new ACK2andACK3Service();
  const result = await ack2andack3Service.dummyget();
  res.status(result.status).send(result.body);
});

module.exports = { ack2andack3Router: router };
