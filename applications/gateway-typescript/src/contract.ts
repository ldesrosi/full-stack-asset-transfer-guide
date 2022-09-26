/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contract } from '@hyperledger/fabric-gateway';
import { TextDecoder } from 'util';

const utf8Decoder = new TextDecoder();

export interface APIRecord {
    ID: string;
    Host: string;
    Path: string;
    Header: string;
    Body: string;
}


/**
 * AssetTransfer presents the smart contract in a form appropriate to the business application. Internally it uses the
 * Fabric Gateway client API to invoke transaction functions, and deals with the translation between the business
 * application and API representation of parameters and return values.
 */
export class AssetTransfer {
    readonly #contract: Contract;

    constructor(contract: Contract) {
        this.#contract = contract;
    }

    async createAsset(asset: APIRecord): Promise<void> {
        await this.#contract.submit('CreateAsset', {
            arguments: [JSON.stringify(asset)],
        });
    }

    async getAllAssets(): Promise<APIRecord[]> {
        const result = await this.#contract.evaluate('GetAllAssets');
        if (result.length === 0) {
            return [];
        }

        return JSON.parse(utf8Decoder.decode(result)) as APIRecord[];
    }

    async assetExists(id: string): Promise<boolean> {
        const result = await this.#contract.evaluate('AssetExists', {
            arguments: [id],
        });
        return utf8Decoder.decode(result).toLowerCase() === 'true';
    }

}

