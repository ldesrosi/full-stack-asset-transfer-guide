// ! challenge#1
const express = require('express');
const router = express.Router();

const { GetAllFromLedger} = require('./utils')



const dotenv = require('dotenv');
var uuid = require('uuid');
dotenv.config();

router.use(function(req, res, next) {
  console.log('Connection to the API..');
  next();
});

router.route('/ledger')
  .get(async function (request, response) {
    const res = await GetAllFromLedger();
    response.send(res)
  });

  module.exports = router;