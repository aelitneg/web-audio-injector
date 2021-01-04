'use strict';

import Config from './config.js';

class InjectorWorker {
    constructor() {
        // Create SharedArrayBuffers for state and audio data
        const SharedBuffers = {
            states: new SharedArrayBuffer(
                Config.STATE_BUFFER_LENGTH * Config.BYTES_PER_STATE
            ),
            audioBuffer: new SharedArrayBuffer(
                Config.AUDIO_BUFFER_LENGTH *
                Config.BYTES_PER_SAMPLE *
                Config.CHANNEL_COUNT
            ),
        };

        // Create local references to SharedArrayBuffers
        this.states = new Int32Array(SharedBuffers.states);
        this.audioBuffer = [new Float32Array(SharedBuffers.audioBuffer)];

        console.log('[web-audio-injector:worker] ', SharedBuffers);

        postMessage({ type: 'ready', payload: { SharedBuffers } });

        this.waitOnRenderRequest();
    }

    waitOnRenderRequest() {
        while (Atomics.wait(this.states, Config.STATE.REQUEST_RENDER, 0) === 'ok') {
            // Wait on Processor to start processing audio
        }

        // Run the processKernel
        this.processKernel();

        // Update count of available samples
        this.states[Config.STATE.SAMPLES_AVAILABLE] += Config.KERNEL_LENGTH;

        // Reset the REQUEST_RENDER flag and wait again.
        Atomics.store(this.states, Config.STATE.REQUEST_RENDER, 0);
        this.waitOnRenderRequest();
    }

    processKernel() {
        // Get current write index location
        let writeIdx = this.states[Config.STATE.WRITE_INDEX];

        // Loop over samples
        for (let i = 0; i < Config.KERNEL_LENGTH; i++) {
            this.audioBuffer[0][writeIdx] = Math.random() * 2 - 1;

            // If write index has reached end of buffer, start at beginning again
            if (writeIdx++ === Config.AUDIO_BUFFER_LENGTH) {
                writeIdx = 0;
            }
        }

        // Update the write index location
        this.states[Config.STATE.WRITE_INDEX] = writeIdx;
    }
}

export default new InjectorWorker();
