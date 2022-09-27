// ! challenge#1
const express = require('express');
const router = express.Router();

const {CreateSmartContract} = require('./utils')



const dotenv = require('dotenv');
var uuid = require('uuid');
dotenv.config();

router.use(function(req, res, next) {
  console.log('Connection to the API..');
  next();
});

router.route('/deposit')
  .post(function (request, response) {

    let body = request.body;
    let req_header = request.headers;
    console.log("Body: " + body + '\n');
    console.log('Header: ' + req_header + '\n');

    let txid = uuid.v4();
    let envid = request.headers['x-env-id'];
    let currency = request.headers['x-currency-id'];
    let accountID = body.account;
    let pipID = body.account_provider;
    let depositAmountInCurrencyUnits = body.depositAmountInCurrencyUnits;

    // calling API
    let Header = JSON.stringify({
      "X-API-KEY": process.env.API_KEY,
      'x-currency-id': currency,
      'x-env-id': envid,
    });
    let Method = 'POST';
    let Path = `/pips/${pipID}/accounts/${accountID}/deposit`;
    let Body = JSON.stringify({
      'depositAmountInCurrencyUnits': depositAmountInCurrencyUnits,
    });


    // calling ChainCode 


    CreateSmartContract(txid, Path, Method, Header, Body);
  });

  module.exports = router;