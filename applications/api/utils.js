const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);



module.exports.CreateSmartContract = function (txid, Path, Method, Header, Body) {

  let Host = 'cbdchackathon-dev.barclays.nayaone.com';
  let Port = 443;
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

}


module.exports.GetAllFromLedger = async function () {

  const res = await exec('source ./.env; cd ../gateway-typescript/; npm start getLedger ');
  const stdout = res.stdout
  const cleanString = stdout.replace('\n> trader@1.0.0 start\n> node ./dist/app \"getLedger\"\n\n','')
  const clean = cleanString.replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/}\"/g, '}').replace(/\\\"/g, '"');
  

  // return clean;
  // const cleanString = splitString[1].replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");

  // var dataObj = JSON.parse(cleanString);

  // console.log(cleanString)
  // const parsedStdout = await stdout.json()
  return JSON.parse(clean);
}