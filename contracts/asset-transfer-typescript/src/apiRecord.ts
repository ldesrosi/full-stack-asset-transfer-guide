/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object as DataType, Property } from 'fabric-contract-api';

@DataType()
export class APIRecord {
    @Property('ID', 'string')
    ID = '';

    @Property('Host', 'string')
    Host = '';

    @Property('Path', 'string')
    Path = '';

    @Property('Header', 'string')
    Header = 0;

    @Property('Body', 'string')
    Body = 0;

    constructor() {
        // Nothing to do
    }

    static newInstance(state: Partial<APIRecord> = {}): APIRecord {
        return {
            ID: assertHasValue(state.ID, 'Missing ID'),
            Host: assertHasValue(state.Host, 'Missing Host'),
            Path: assertHasValue(state.Path, 'Missing Path'),
            Header: state.Header ?? 0,
            Body: state.Body ?? 0
        };
    }
}

function assertHasValue<T>(value: T | undefined | null, message: string): T {
    if (value == undefined || (typeof value === 'string' && value.length === 0)) {
        throw new Error(message);
    }

    return value;
}
