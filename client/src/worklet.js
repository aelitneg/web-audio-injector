'use strict';

class WebAudioInjectorNode extends AudioWorkletNode {
    constructor(context) {
        super(context, 'injector-processor');

        this.port.onmessage = (e) => {
            console.log('[web-audio-injector:worklet]', e);
        };

        this.port.postMessage({ type: 'ping' });
    }
}

export default WebAudioInjectorNode;
