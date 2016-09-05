/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as assert from 'assert';
const _gcsignals = require('../build/Release/gcsignals');

let handle: NodeJS.Timer;
let intervalTimeout = 30 * 1000; // 30sec

export const config = {
    set interval(value: number) {
        intervalTimeout = value;
        if (handle) {
            uninstallInterval();
            installInterval();
        }
    },
    get interval(): number {
        return intervalTimeout;
    }
}

let idPool = 0;
const listeners = new Map<number, Function>();
const signals = new WeakMap();

export interface IdentifiedObject {
    _id: number;
}

export function mixinIdentifier<T>(obj: T): T & IdentifiedObject {
    assert.ok(Object.isExtensible(obj), 'object not extensible');
    assert.ok(obj['_id'] === void 0, 'object has already an identifier');

    obj['_id'] = ++idPool;
    return <T & IdentifiedObject> obj;
}

export function onDidGarbageCollect(obj: any | IdentifiedObject, callback: (id: number) => any): number {

    let id: number;
    if (typeof (<IdentifiedObject> obj)._id === 'number') {
        id = (<IdentifiedObject>obj)._id;
        assert.ok(!listeners.has(id), `object identifier (${id}) already in use`)
    } else {
        id = ++idPool;
    }

    listeners.set(id, callback);
    signals.set(obj, new _gcsignals.GCSignal(id));

    if (!handle) {
        installInterval();
    }

    return id;
}

function checkForGCed() {

    for (const id of _gcsignals.consumeSignals()) {
        const callback = listeners.get(id);

        if (!callback) {
            console.error('received signal for unknown id', id);
            continue;
        }

        try {
            callback(id);
        } finally {
            listeners.delete(id);
        }
    }
}

function checkForIdle() {
    if (listeners.size === 0) {
        uninstallInterval();
    }
}

function installInterval() {
    handle = setInterval(function () {
        checkForGCed();
        checkForIdle();
    }, intervalTimeout);

    // don't make NodeJS stick around
    // because of this timer handle
    handle.unref();
}

function uninstallInterval() {
    clearInterval(handle);
    handle = void 0;
}
