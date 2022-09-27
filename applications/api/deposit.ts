const express = require('express');
const bodyParser = require("body-parser");
const router = express.Router();
const { exec } = require("child_process");
const dotenv = require('dotenv');
var uuid = require('uuid');
dotenv.config();


const app = express()
const port = 3030

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", router);

app.get('/', (err, res) => {
  if (!err) {
    res.status(200).send('Hello!!!');
  } else {
    console.error(err);
  }
});

// ! challenge1

router.get('/',(req, res) => {
  res.send("Hello");
  });

router.post('/deposit', (request, response) => {
  //code to perform particular action.
  //To access POST variable use req.body()methods.

  //console.log('/deposit: request.body: ' + request.body);

  console.log(request.body)
  let body = request.body;
  let txid = uuid.v4();
  let envid = body.envid;
  let depositAmountInCurrencyUnits = body.depositAmountInCurrencyUnits;
  let currency = body.currency;
  let accountID = body.account;
  let pipID = body.pip_id;

  // calling API
  let Host = 'cbdchackathon-dev.barclays.nayaone.com';
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
  let Port = 443;



  // calling ChainCode 
  let commandDir = 'source ./.env; cd ../gateway-typescript/; npm start';

  exec(`${commandDir} create ${JSON.stringify(txid)} ${JSON.stringify(Host)} ${JSON.stringify(Port)} ${JSON.stringify(Path)} ${JSON.stringify(Method)} ${JSON.stringify(Header)} ${JSON.stringify(Body)}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

});

app.listen(port, () => console.log(`Running on port ${port}`))