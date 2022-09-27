// ! challenge#2
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const { CreateSmartContract } = require("./utils");
var uuid = require('uuid');
dotenv.config();


const app = express()

router.route('/transfer')
    .post(function(request, response) {
        
        // parse request values
        let body = request.body;
        let req_header = request.headers;

        let envid = request.headers['x-env-id'];
        let currency = request.headers['x-currency-id'];

        let sourceAccountType = body.sourceAccountType;
        let sourceAccountId = body.sourceAccountId;
        let destinationAccountType = body.destinationAccountType;
        let destinationAccountId = body.destinationAccountId;
        let paymentAmountInCurrencyUnits = body.paymentAmountInCurrencyUnits;

        let txid = uuid.v4();  // generate unique transactionID

        // do: domestic-payments endpoint
        // if resp.status_code == 400 := not enough money
        // if resp.status_code == 201 : payment triggered

        // calling API
        let Host = 'cbdchackathon-dev.barclays.nayaone.com';
        let Header = JSON.stringify({
            "X-API-KEY": process.env.API_KEY,
            'x-currency-id': currency,
            'x-env-id': envid,
            });

        let Method = 'POST'; 
        let Path = '/domestic-payments';
        let Body = JSON.stringify({
            paymentAmountInCurrencyUnits: paymentAmountInCurrencyUnits,
            sourceAccountId: sourceAccountId,
            destinationAccountId: destinationAccountId,
        });
        // calling ChainCode
        CreateSmartContract(txid, Path, Method, Header, Body);
    });

    module.exports = router;