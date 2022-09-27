/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gateway } from '@hyperledger/fabric-gateway';
import { CHAINCODE_NAME, CHANNEL_NAME } from '../config';
import { AssetTransfer } from '../contract';
import { assertAllDefined } from '../utils';

export default async function main(gateway: Gateway, args: string[]): Promise<void> {
    const [id, host, port, path, method, headers, body] = assertAllDefined([args[0], args[1], args[2], args[3], args[4], args[5], args[6]], 'Arguments: <assetId> <host> <port> <path> <method> <header> <body>');

    const network = gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    const smartContract = new AssetTransfer(contract);

    console.log(args);
    await smartContract.createAsset({
        txid: id,
        host: host,
        port: port,
        path: path,
        method: method,
        headers: headers,
        body: body,
        statusCode: '',
        response: '',
    });
}
