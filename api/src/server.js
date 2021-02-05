const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const cfg = require('../config');

const { ack2andack3Router } = require('./routes/ack2andack3');
const { inwdCrdCnfRouter } = require('./routes/inwdCrdCnf');

const app = express();

app.use('/public', express.static(__dirname + '/public'));

app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
app.use(bodyParser.text());

app.use('/api/v1/ack2andack3', ack2andack3Router);
app.use('/api/v1/inwardcreditconfirmation', inwdCrdCnfRouter);

module.exports = app;
