'use strict';

class WebAudioInjectorNode extends AudioWorkletNode {
    constructor(context) {
        super(context, 'injector-processor');

        this.port.onmessage = (event) => {
            const { type } = event.data;

            switch (type) {
                case 'ready':
                    break;
                default:
                    console.warn(
                        `web-audio-injector:worklet] Unhandled message type: ${type}`,
                    );
                    console.log('[web-audio-injector:worklet]', event.data);
            }
        };
    }

    postMessage(msg) {
        this.port.postMessage(msg);
    }
}

export default WebAudioInjectorNode;
