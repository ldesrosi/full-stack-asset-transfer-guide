const { exec } = require("child_process");



module.exports.CreateSmartContract = function(txid, Path, Method, Header, Body) {

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
