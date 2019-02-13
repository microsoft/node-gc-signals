/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { EventEmitter } from 'events';
import { ok } from 'assert';

const _gcsignals = require('../build/Release/gcsignals');

export interface GCSignal { };

/**
 * Create a new GC signal. When being garbage collected the passed
 * value is stored for later consumption.
 */
export const GCSignal: { new(id: number): GCSignal } = _gcsignals.GCSignal;

const _emitter = new EventEmitter();

/**
 * Consume ids of garbage collected signals.
 */
export function consumeSignals(): number[] {
    const signals = Object.freeze(_gcsignals.consumeSignals());
    if (signals.length > 0) {
        // remove form list of active ids
        for (const id of signals) {
            activeIds.delete(id);
        }
        // send event
        _emitter.emit('gc', signals);
    }
    return signals;
}

type Callback = (ids: number[]) => any;

/**
 * Get called when any call to `consumeSignals` yielded in a result.
 */
export function onDidGarbageCollectSignals(callbackIn: Callback): { dispose(): void } {
    let callback: Callback | undefined = callbackIn;
    ok(typeof callback === 'function');

    _emitter.addListener('gc', callback);

    return {
        dispose() {
            if (callback) {
                _emitter.removeListener('gc', callback);
                callback = undefined;
            }
        }
    }
}


// --- util

const activeSignals = new WeakMap<any, GCSignal>();
const activeIds = new Set<number>();

/**
 * Utility method to store a weak reference of an object
 * along with an identifier. The id will be used to track
 * garbage collection of the object.
 */
export function trackGarbageCollection(obj: any, id: number): number {
    ok(typeof obj === 'object', 'obj must be an object');
    ok(typeof id === 'number', 'id must be a number');
    ok(!activeIds.has(id), `object-id (${id}) in use`)

    activeIds.add(id);
    activeSignals.set(obj, new GCSignal(id));
    return id;
}
