'use strict';

class InjectorProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this.port.onmessage = (e) => {
            console.log('[injector-processor]', e);
        };

        this.port.postMessage({ type: 'ping' });
    }

    process(inputs, outputs) {
        return true;
    }
}

registerProcessor('injector-processor', InjectorProcessor);
