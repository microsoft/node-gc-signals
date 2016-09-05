/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as assert from 'assert';
import { config, onDidGarbageCollect } from '../src/index';


config.interval = 50;
assert.ok(typeof global.gc === 'function', 'start with --expose-gc');


const garbage = new Set<number>();

function createItems() {
    for (let i = 0; i < 500; i++) {
        let thing = new class {
            id = i;
        };
        onDidGarbageCollect(thing, function (id) {
            assert.ok(typeof id === 'number');
            assert.ok(!garbage.has(id));
            garbage.add(id);
        });
    }
}

setTimeout(createItems, 100 * Math.random());
setTimeout(createItems, 200 * Math.random());

let handle = setInterval(function () {

    global.gc();
    console.log('Collected Total', garbage.size);
    if (garbage.size === 1000) {
        // console.log(collected);
        clearInterval(handle);
    }

}, 25);