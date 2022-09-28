/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object as DataType, Property } from 'fabric-contract-api';

@DataType()
export class Crowdfunding {
    @Property('fundingid', 'string')
    fundingid = '';

    @Property('endDate', 'string')
    endDate = '';

    constructor() {
        // Nothing to do
    }

    static newInstance(state: Partial<Crowdfunding> = {}): Crowdfunding {
        return {
            fundingid: assertHasValue(state.fundingid, 'Missing fundingid'),
            endDate: assertHasValue(state.endDate, 'Missing endDate'),
        };
    }
}

function assertHasValue<T>(value: T | undefined | null, message: string): T {
    if (value == undefined || (typeof value === 'string' && value.length === 0)) {
        throw new Error(message);
    }

    return value;
}