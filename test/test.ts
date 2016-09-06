/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as assert from 'assert';
import {GCSignal, consumeSignals} from '../src/index';

assert.ok(typeof global.gc === 'function', 'start with --expose-gc');

const garbage = new Set<number>();
const total = 1000;
let idPool = 0;

function createItems() {
    for (let i = 0; i < total; i++) {
        new GCSignal(idPool++);
    }
}

setTimeout(createItems, Math.random() * 300);
setTimeout(createItems, Math.random() * 600);

let handle = setInterval(function () {

    global.gc();

    for (const id of consumeSignals()) {
        garbage.add(id);
    }
    console.log('Collected Total', garbage.size);

    if (garbage.size === 2 * total) {
        // console.log(collected);
        clearInterval(handle);
    }

}, 25);