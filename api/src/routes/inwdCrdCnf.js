const express = require('express');
const InwdCrdCnfService = require('../services/inwdCrdCnfService');

const router = express.Router();

router.post('', async (req, res) => {
  const inwdCrdCnfService = new InwdCrdCnfService();
  const result = await inwdCrdCnfService.inwardCreditConfirmation(req.body);
  res.status(result.status).send(result.body);
});

module.exports = { inwdCrdCnfRouter: router };
