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
export const GCSignal: { new (id: number): GCSignal } = _gcsignals.GCSignal;

const _emitter = new EventEmitter();

/**
 * Consume ids of garbage collected signals.
 */
export function consumeSignals(): number[] {
    const signals = Object.freeze(_gcsignals.consumeSignals());
    if (signals.length > 0) {
        _emitter.emit('gc', signals);
    }
    return signals;
}

export function onDidGarbageCollectSignals(callback: (ids: number[]) => any): { dispose(): void } {
    ok(typeof callback === 'function');

    _emitter.addListener('gc', callback);

    return {
        dispose() {
            if (callback) {
                _emitter.removeListener('gc', callback);
                callback = null;
            }
        }
    }
}