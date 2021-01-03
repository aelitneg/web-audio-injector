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
            audioContext: {
                playing: false,
            }
        };

        $(document).ready(() => {
            $('#audio-context-suspended-alert').attr('hidden', true);

            $('#audio-context-suspended-alert').click(async () => {
                await this.audioContext.resume();
                this.render();
            });

            $('#transport').click(() => {
                this.state.audioContext.playing ? this.stop() : this.play();
                this.state.audioContext.playing = !this.state.audioContext.playing;
                this.render();
            });
        });
    }

    async initialize() {
        try {
            this.audioContext = new AudioContext();

            await this.audioContext.audioWorklet.addModule(
                './processor.js',
            );

            this.worklet = new InjectorWorklet(this.audioContext);

            this.worker = new Worker('./worker.js', { type: 'module' });
            this.worker.onmessage = this.handleWorkerMessage.bind(this);
        } catch (error) {
            console.error('[web-audio-injector]', error);
        }
    }

    handleWorkerMessage(event) {
        const { type, payload } = event.data;

        switch (type) {
            case 'ready':
                this.worklet.postMessage({ type: 'init', payload });
                break;
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

    play() {
        this.worklet.connect(this.audioContext.destination);
    }

    stop() {
        this.worklet.disconnect(this.audioContext.destination);
    }

    updateWorkerStatus(payload) {
        const { worker } = this.state;

        worker.audioFile = payload.audioFile;
        worker.audioSocket = this._stateToStatus(payload.audioSocket);
        worker.dataSocket = this._stateToStatus(payload.dataSocket);

        this.render();
    }

    render() {
        const { worker, audioContext } = this.state;

        this.audioContext.state === 'suspended'
            ? $('#audio-context-suspended-alert').attr('hidden', false)
            : $('#audio-context-suspended-alert').attr('hidden', true);

        $('#transport').text(audioContext.playing ? 'STOP' : 'PLAY');
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
