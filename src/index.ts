/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const _gcsignals = require('../build/Release/gcsignals');

export interface GCSignal { };

/**
 * Create a new GC signal. When being garbage collected the passed
 * value is stored for later consumption.
 */
export const GCSignal: { new (id: number): GCSignal } = _gcsignals.GCSignal;

/**
 * Consume ids of garbage collected signals.
 */
export const consumeSignals: { (): number }[] = _gcsignals.consumeSignals;

