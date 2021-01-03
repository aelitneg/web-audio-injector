'use strict';

class InjectorProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this.port.onmessage = (e) => {
            console.log('[web-audio-injector:processor]', e);
        };

        this.port.postMessage({ type: 'ping' });
    }

    process() {
        return true;
    }
}

registerProcessor('injector-processor', InjectorProcessor);
