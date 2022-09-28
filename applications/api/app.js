const express = require('express');
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const dotenv = require('dotenv');
dotenv.config();



const app = express()
const port = 3030;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const Deposit = require('./deposit.js');
const Transfer = require('./transfer.js');
const Ledger = require('./ledger.js');

app.use('/api', Deposit, Transfer, Ledger);

app.listen(port, () => console.log(`Running on port ${port}`));


module.exports = app;