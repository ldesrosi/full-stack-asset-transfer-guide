/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Param, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic'; // Deterministic JSON.stringify()
import sortKeysRecursive from 'sort-keys-recursive';
import { TextDecoder } from 'util';
import { APIRecord } from './apiRecord';
import { Crowdfunding } from './crowdfunding';

const utf8Decoder = new TextDecoder();

@Info({title: 'AssetTransfer', description: 'Smart contract for trading assets'})
export class AssetTransferContract extends Contract {
    /**
     * CreateAsset issues a new asset to the world state with given details.
     */
    @Transaction()
    @Param('state', 'APIRecord', 'Part formed JSON of an API Record')
    async CreateAsset(ctx: Context, state: APIRecord): Promise<void> {
        const asset = APIRecord.newInstance(state);

        const exists = await this.AssetExists(ctx, asset.txid);
        if (exists) {
            throw new Error(`The asset ${asset.txid} already exists`);
        }

        const assetBytes = marshal(asset);
        await ctx.stub.putState(asset.txid, assetBytes);

        ctx.stub.setEvent('CreateAsset', assetBytes);
    }

    async StartCrowdfunding(ctx: Context, state: Crowdfunding): Promise<void> {
        const asset = Crowdfunding.newInstance(state);

        const exists = await this.AssetExists(ctx, asset.fundingid);
        if (exists) {
            throw new Error(`The asset ${asset.fundingid} already exists`);
        }

        const assetBytes = marshal(asset);
        const key = ctx.stub.createCompositeKey('Funding',[asset.fundingid]);
        await ctx.stub.putState(key, assetBytes);
    }

    async EndCrowdfunding(ctx: Context, fundingid: string): Promise<void> {
        const key = ctx.stub.createCompositeKey('Funding',[fundingid]);

        const existingAssetBytes = await this.#readAsset(ctx, key);
        const currentFunding = Crowdfunding.newInstance(unmarshal(existingAssetBytes));

        const paymentList = ctx.stub.getStateByPartialCompositeKey('Payment',[currentFunding.fundingid,'2']);
        const allEvents = [];
        for await (const res of paymentList) {
            allEvents.push(APIRecord.newInstance(unmarshal(res.value)));
        }
        const allEventsBytes = marshal(allEvents);

        ctx.stub.setEvent('Multiple', allEventsBytes);
    }

    async StartPayment(ctx: Context, stateConsent: APIRecord, statePayment: APIRecord, fundingid?: string): Promise<void> {
        const consent = APIRecord.newInstance(stateConsent);
        const payment = APIRecord.newInstance(statePayment);

        if (!fundingid) {
            fundingid='0';
        }

        const consentKey = ctx.stub.createCompositeKey('Payment',[fundingid,'1',consent.txid]);
        const paymentKey = ctx.stub.createCompositeKey('Payment',[fundingid,'2',payment.txid]);

        const existsConsent = await this.AssetExists(ctx, consentKey);
        if (existsConsent) {
            throw new Error(`The consent key ${consentKey} already exists`);
        }


        const existsPayment = await this.AssetExists(ctx, paymentKey);
        if (existsPayment) {
            throw new Error(`The payment key ${paymentKey} already exists`);
        }

        const consentBytes = marshal(consent);
        const paymentBytes = marshal(payment);

        await ctx.stub.putState(consentKey, consentBytes);
        await ctx.stub.putState(paymentKey, paymentBytes);

        ctx.stub.setEvent('GetConsent', consentBytes);
    }

    async CompletePayment(ctx: Context, txid: string, fundingid?: string): Promise<void> {
        if (!fundingid) {
            fundingid='0';
        }
        const consentKey = ctx.stub.createCompositeKey('Payment',[fundingid,'1',txid]);
        const consentBytes = await this.#readAsset(ctx, consentKey);
        const consentRecord = APIRecord.newInstance(unmarshal(consentBytes));

        if (consentRecord.statusCode == "200") {
            const paymentKey = ctx.stub.createCompositeKey('Payment',[fundingid,'2',txid]);
            const paymentBytes = await this.#readAsset(ctx, paymentKey);
            const paymentRecord = APIRecord.newInstance(unmarshal(paymentBytes));
            
            // let consentResponse = JSON.parse(consentRecord.response);
            
            // Move consent id to payment record body payload
            const updatedPaymentBytes = marshal(paymentRecord);
            await ctx.stub.putState(paymentKey, updatedPaymentBytes);

            ctx.stub.setEvent('CompletePayment', updatedPaymentBytes);

        } else {
            throw new Error('Consent not yet achieved.');
        }
    }

    @Transaction()
    @Param('state', 'APIRecord', 'Part formed JSON of an API Record')
    async UpdateStatus(ctx: Context, state: APIRecord): Promise<void> {
        const asset = APIRecord.newInstance(state);
        console.log("-----" + typeof(asset));
        if (asset.txid === undefined) {
            throw new Error('No asset ID specified');
        }

        await this.#readAsset(ctx, asset.txid);

        const updatedStateBytes = marshal(asset);
        await ctx.stub.putState(asset.txid, updatedStateBytes);
    }

    /**
     * ReadAsset returns an existing asset stored in the world state.
     */
    @Transaction(false)
    @Returns('APIRecord')
    async ReadAsset(ctx: Context, id: string): Promise<APIRecord> {
        const existingAssetBytes = await this.#readAsset(ctx, id);
        const existingAsset = APIRecord.newInstance(unmarshal(existingAssetBytes));

        return existingAsset;
    }

    async #readAsset(ctx: Context, id: string): Promise<Uint8Array> {
        const assetBytes = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`Sorry, asset ${id} has not been created`);
        }

        return assetBytes;
    }

    /**
     * AssetExists returns true when asset with the specified ID exists in world state; otherwise false.
     */
    @Transaction(false)
    @Returns('boolean')
    async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJson = await ctx.stub.getState(id);
        return assetJson?.length > 0;
    }

    /**
     * GetAllAssets returns a list of all assets found in the world state.
     */
    @Transaction(false)
    @Returns('string')
    async GetAllAssets(ctx: Context): Promise<string> {
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');

        const assets: APIRecord[] = [];
        for (let result = await iterator.next(); !result.done; result = await iterator.next()) {
            const assetBytes = result.value.value;
            try {
                const asset = APIRecord.newInstance(unmarshal(assetBytes));
                assets.push(asset);
            } catch (err) {
                console.log(err);
            }
        }

        return marshal(assets).toString();
    }
}

function unmarshal(bytes: Uint8Array | string): object {
    const json = typeof bytes === 'string' ? bytes : utf8Decoder.decode(bytes);
    const parsed: unknown = JSON.parse(json);
    if (parsed === null || typeof parsed !== 'object') {
        throw new Error(`Invalid JSON type (${typeof parsed}): ${json}`);
    }

    return parsed;
}

function marshal(o: object): Buffer {
    return Buffer.from(toJSON(o));
}

function toJSON(o: object): string {
    // Insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    return stringify(sortKeysRecursive(o));
}