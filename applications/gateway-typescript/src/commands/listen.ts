/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChaincodeEvent, checkpointers, Gateway, Network } from '@hyperledger/fabric-gateway';
import * as path from 'path';
import { CHAINCODE_NAME, CHANNEL_NAME } from '../config';
import { AssetTransfer } from '../contract';
import { printable } from '../utils';
import { TextDecoder } from 'util';
import https from 'node:https';

const utf8Decoder = new TextDecoder();

const checkpointFile = path.resolve(process.env.CHECKPOINT_FILE ?? 'checkpoint.json');

const startBlock = BigInt(0);

export default async function main(gateway: Gateway): Promise<void> {
    const network = gateway.getNetwork(CHANNEL_NAME);
    const checkpointer = await checkpointers.file(checkpointFile);

    console.log(`Starting event listening from block ${checkpointer.getBlockNumber() ?? startBlock}`);
    console.log('Last processed transaction ID within block:', checkpointer.getTransactionId());

    const events = await network.getChaincodeEvents(CHAINCODE_NAME, {
        startBlock: startBlock, // Used only if there is no checkpoint block number
        checkpoint: checkpointer,
    });

    try {
        for await (const event of events) {
           x onEvent(event, network);
            await checkpointer.checkpointTransaction(event.blockNumber, event.transactionId);
        }
    } finally {
        events.close();
    }
}

async function onEvent(event: ChaincodeEvent, network: Network): void {
    console.log(printable(event));

    var apiDetails = JSON.parse(utf8Decoder.decode(event.payload));

    var headers = JSON.parse(apiDetails.headers);
    headers['Content-Type'] = 'application/json';
    if (apiDetails.body) {
        headers['Content-Length'] = Buffer.byteLength(apiDetails.body);
    }
    
    var options = {
        host: apiDetails.host,
        port: apiDetails.port,
        path: apiDetails.path,
        method: apiDetails.method,
        headers: headers,
      };

    var req = https.request(options, async resp => {
        console.log(`STATUS: ${resp.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
        var statusCode = resp.statusCode;
        var responseData = "";

        resp.setEncoding('utf8');
        resp.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
          responseData += chunk;
        });

        resp.on('end', async () => {
          console.log('Updating Transaction Status.');
          await updateTransaction(apiDetails.id, statusCode,responseData,network)
        });
    });

    if (apiDetails.body) {
        req.write(apiDetails.body);
    }
    req.end();
    
}

async function updateTransaction(id: string, statusCode: number | undefined, response: string, network: Network) {
    const contract = network.getContract(CHAINCODE_NAME);

    const smartContract = new AssetTransfer(contract);
    await smartContract.createAsset({
        ID: assetId,
        Host: host,
        Path: path,
        Header: header,
        Body: body,
    });
}

