/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gateway } from '@hyperledger/fabric-gateway';
import create from './create';
import getAllAssets from './getAllAssets';
import listen from './listen';

export type Command = (gateway: Gateway, args: string[]) => Promise<void>;

export const commands: Record<string, Command> = {
    create,
    getAllAssets,
    listen,
};
