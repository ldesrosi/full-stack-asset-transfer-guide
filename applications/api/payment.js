// ! challenge#4
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const { CreateSmartContract } = require("./utils");
var uuid = require('uuid');
dotenv.config();

const app = express();


/**
[FE]
 * 1. User goes to the shop UI and makes a purchase;
 * 2. User returns to the account UI (Transactions/); where a new transaction approval is pending;
 * 3. User clicks `approves`; Payment confirmed!

[BE]
 * 1. Create a PaymentListing<APIRecord>
**/

router.route('/payment')
    .post(function(request, response) {

        // parse header
        let envID = request.headers['x-env-id'];
        let currency = request.headers['x-currency-id'];
        let requestBankingEntity = request.headers['x-requesting-banking-entity-id'];
        let consentId = request.headers['x-contest-id'];

        // parse body
        let sourceAccountId = request.body.sourceAccountId;
        let destinationAccountId = request.body.destinationAccountId;
        let paymentAmountInCurrencyUnits = request.body.paymentAmountInCurrencyUnits;

        let txid = uuid.v4();
        
        let Header = JSON.stringify({
            'X-API-KEY': process.env.API_KEY,
            'x-currency-id': currency,
            'x-requesting-banking-entity-id': requestBankingEntity,
            'x-constent-id': consentId
        });
        let Method = 'POST';
        let Path = 'open-banking/pisp/domestic-payment-consents';
        let Body = JSON.stringify({
        });

        
    })
