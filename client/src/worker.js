'use strict';

class InjectorWorker {
    handleMessage(event) {
        console.log('[web-audio-injector:worker] handleMessage', event);
        const { type, payload } = event.data;

        switch (type) {
            case 'init':
                this.initialize(payload);
                break;
            default:
                console.warn(
                    `web-audio-injector:worker] Unhandled worker message type: ${type}`,
                );
                console.log('[web-audio-injector:worker]', event.data);
        }
    }

    initialize(config) {
        this.config = config;

        // Create SharedArrayBuffers for state and audio data
        const sharedBuffers = {
            states: new SharedArrayBuffer(
                config.STATE_BUFFER_LENGTH * config.BYTES_PER_STATE
            ),
            audioBuffer: new SharedArrayBuffer(
                config.AUDIO_BUFFER_LENGTH *
                config.BYTES_PER_SAMPLE *
                config.CHANNEL_COUNT
            ),
        };

        // Create local references to SharedArrayBuffers
        this.states = new Int32Array(sharedBuffers.states);
        this.audioBuffer = [new Float32Array(sharedBuffers.audioBuffer)];

        console.log('[web-audio-injector:worker] ', sharedBuffers);

        // Notify client that InjectorWorker is ready, pass back ref to SharedBuffers
        postMessage({ type: 'ready', payload: { sharedBuffers } });
    }

    waitOnRenderRequest() {
        const config = this.config

        while (Atomics.wait(this.states, config.STATE.REQUEST_RENDER, 0) === 'ok') {
            // Wait on Processor to start processing audio
        }

        // Run the processKernel
        this.processKernel();

        // Update count of available samples
        this.states[config.STATE.SAMPLES_AVAILABLE] += config.KERNEL_LENGTH;

        // Reset the REQUEST_RENDER flag and wait again.
        Atomics.store(this.states, config.STATE.REQUEST_RENDER, 0);
        return this.waitOnRenderRequest();
    }

    processKernel() {
        const config = this.config;

        // Get current write index location
        let writeIdx = this.states[config.STATE.WRITE_INDEX];

        // Loop over samples
        for (let i = 0; i < config.KERNEL_LENGTH; i++) {
            this.audioBuffer[0][writeIdx] = Math.random() * 2 - 1;

            // If write index has reached end of buffer, start at beginning again
            if (writeIdx++ === config.AUDIO_BUFFER_LENGTH) {
                writeIdx = 0;
            }
        }

        // Update the write index location
        this.states[config.STATE.WRITE_INDEX] = writeIdx;
    }
}

const injectorWorker = new InjectorWorker();
onmessage = injectorWorker.handleMessage.bind(injectorWorker);