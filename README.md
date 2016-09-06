
## GC Signals

A primitive way to know when an object got garbage collected. It works by creating an object holding onto a numeric identifier. On de-construction that identifer is put into a list which can be consumed to learn whether an object was been gc'ed or not.


```

const {GCSignal, consumeSignals} = require('gc-signals');

new GCSignal(1);
new GCSignal(2);
new GCSignal(3);

// gc happens...

consumeSignals() // [1,2,3];

```

### API

```ts
export interface GCSignal {
}
/**
 * Create a new GC signal. When being garbage collected the passed
 * value is stored for later consumption.
 */
export declare const GCSignal: {
    new (id: number): GCSignal;
};
/**
 * Consume ids of garbage collected signals.
 */
export declare function consumeSignals(): number[];
/**
 * Get called when any call to `consumeSignals` yielded in a result.
 */
export declare function onDidGarbageCollectSignals(callback: (ids: number[]) => any): {
    dispose(): void;
};
/**
 * Utility method to store a weak reference of an object
 * along with an identifier. The id will be used to track
 * garbage collection of the object.
 */
export declare function trackGarbageCollection(obj: any, id: number): number;
```