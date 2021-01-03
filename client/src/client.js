'use strict';

import InjectorWorklet from './worklet.js';

class InjectorClient {
    constructor() {
        this.state = {
            worker: {
                dataSocket: 'INIT',
                audioSocket: 'INIT',
                audioFile: {
                    channels: 0,
                    sampleRate: 0,
                    bitDepth: 0,
                    frameCount: 0,
                    bufferLength: 0,
                },
            },
        };
    }

    async initialize() {
        try {
            this.worker = new Worker('./worker.js');
            this.worker.onmessage = this.handleWorkerMessage.bind(this);

            this.audioContext = new AudioContext();

            this.injectorNode = await this.audioContext.audioWorklet.addModule(
                './processor.js',
            );

            this.worklet = new InjectorWorklet(this.audioContext);
        } catch (error) {
            console.error('[web-audio-injector]', error);
        }
    }

    handleWorkerMessage(event) {
        const { type, payload } = event.data;

        switch (type) {
            case 'status':
                this.updateWorkerStatus(payload);
                break;
            default:
                console.warn(
                    `[web-audio-injector] Unhandled message type: ${type}`,
                );
                console.log('[web-audio-injector]', event.data);
        }
    }

    updateWorkerStatus(payload) {
        const { worker } = this.state;

        worker.audioFile = payload.audioFile;
        worker.audioSocket = this._stateToStatus(payload.audioSocket);
        worker.dataSocket = this._stateToStatus(payload.dataSocket);

        this.render();
    }

    render() {
        const { worker } = this.state;

        $('#data-socket').text(worker.dataSocket);
        $('#audio-socket').text(worker.audioSocket);

        $('#channels').text(worker.audioFile.channels);
        $('#sample-rate').text(`${worker.audioFile.sampleRate / 1000} kHz`);
        $('#bit-depth').text(worker.audioFile.bitDepth);
        $('#frame-count').text(worker.audioFile.frameCount);
        $('#buffer-length').text(worker.audioFile.bufferLength);
    }

    _stateToStatus(state) {
        switch (state) {
            case 0:
                return 'CONECTING';
            case 1:
                return 'CONNECTED';
            case 2:
                return 'CLOSING';
            case 3:
                return 'CLOSED';
            default:
                return 'UNKNOWN';
        }
    }
}

export default InjectorClient;
