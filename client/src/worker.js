'use strict';

import Config from './config.js';

class InjectorWorker {
    constructor() {
        this.audioFile = {
            channels: 0,
            sampleRate: 0,
            bitDepth: 0,
            frameCount: 0,
            bufferLength: 0,
        };

        this.dataSocket = new WebSocket('ws://localhost:3000');
        this.dataSocket.onmessage = this.handleMessage.bind(this);
        this.dataSocket.onopen = this.dataSocketOpen.bind(this);
        this.dataSocket.onclose = this.dataSocketClose.bind(this);

        this.audioSocket = new WebSocket('ws://localhost:3001');
        this.audioSocket.onmessage = this.handleAudio.bind(this);
        this.audioSocket.onopen = this.audioSocketOpen.bind(this);
        this.audioSocket.onclose = this.audioSocketClose.bind(this);

        this.frames = 0;
        this.xferStart;

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

        //this.waitOnRenderRequest();
    }

    handleMessage(event) {
        const { type, payload } = JSON.parse(event.data);

        switch (type) {
            case 'status':
                this.parseStatus(payload);
                break;
            default:
                postMessage(JSON.parse(event.data));
        }
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

    handleAudio() {
        if (this.frames == 0) {
            this.xferStart = performance.now();
            console.log('[web-audio-injector:worker] receiving audio...');
        }

        this.frames++;

        if (
            this.frames >=
            Math.ceil(this.audioFile.frameCount / this.audioFile.bufferLength)
        ) {
            const diff = performance.now() - this.xferStart;
            console.log(
                `[web-audio-injector:worker] received ${this.frames} frames in ${diff} ms`,
            );
            this.frames = 0;
        }
    }

    dataSocketOpen() {
        console.log('[web-audio-injector:worker] dataSocket opened');
        this.sendMessage({ type: 'status' });
        this.updateStatus();
    }

    dataSocketClose() {
        console.log('[web-audio-injector:worker] dataSocket closed');
        this.updateStatus();
    }

    audioSocketOpen() {
        console.log('[web-audio-injector:worker] audioSocket opened');
        this.updateStatus();
    }

    audioSocketClose() {
        console.log('[web-audio-injector:worker] audioSocket closed');
        this.updateStatus();
    }

    parseStatus(payload) {
        const audioFile = this.audioFile;

        audioFile.channels = payload.channels;
        audioFile.sampleRate = payload.sample_rate;
        audioFile.bitDepth = payload.bit_depth * 8;
        audioFile.frameCount = payload.frame_count;
        audioFile.bufferLength = payload.buffer_length;

        this.updateStatus();
    }

    updateStatus() {
        postMessage({
            type: 'status',
            payload: {
                audioFile: this.audioFile,
                dataSocket: this.dataSocket.readyState,
                audioSocket: this.audioSocket.readyState,
            },
        });
    }

    sendMessage(msg) {
        console.log('[web-audio-injector:worker] sending message', msg);
        this.dataSocket.send(JSON.stringify(msg));
    }
}

export default new InjectorWorker();
