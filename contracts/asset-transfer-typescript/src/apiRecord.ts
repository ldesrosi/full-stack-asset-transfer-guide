/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object as DataType, Property } from 'fabric-contract-api';

@DataType()
export class APIRecord {
    @Property('txid', 'string')
    txid = '';

    @Property('host', 'string')
    host = '';

    @Property('port', 'string')
    port = '';

    @Property('path', 'string')
    path = '';

    @Property('method', 'string')
    method = '';

    @Property('headers', 'string')
    headers = '';

    @Property('body', 'string')
    body = '';

    @Property('statusCode', 'string')
    statusCode = '';

    @Property('response', 'string')
    response = '';

    constructor() {
        // Nothing to do
    }

    static newInstance(state: Partial<APIRecord> = {}): APIRecord {
        return {
            txid: assertHasValue(state.txid, 'Missing txid'),
            host: assertHasValue(state.host, 'Missing host'),
            port: assertHasValue(state.port, 'Missing port'),            
            path: assertHasValue(state.path, 'Missing path'),
            method: assertHasValue(state.method, 'Missing method'),
            headers: state.headers ?? '',
            body: state.body ?? '',
            statusCode: state.statusCode ?? '',
            response: state.response ?? ''
        };
    }
}

function assertHasValue<T>(value: T | undefined | null, message: string): T {
    if (value == undefined || (typeof value === 'string' && value.length === 0)) {
        throw new Error(message);
    }

    return value;
}
