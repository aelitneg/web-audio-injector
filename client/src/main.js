'use strict';

import InjectorNode from './injectorNode.js';

console.log('[web-audio-injector] initializing');

/**
 * Application state
 */
const state = {
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
    audioContext: 'INIT',
};

/**
 * Create Worker thread for WebSocket connection to server
 */
const worker = new Worker('/worker.js');

/**
 * Create WebAudioAPI Context
 */
const audioContext = new AudioContext();
let injectorNode;

/**
 * Register AudioWorkletProcessor with AudioContext
 */
audioContext.audioWorklet
    .addModule('./injectorProcessor.js')
    .then(function () {
        console.log('[web-audio-injector]', audioContext);
        injectorNode = new InjectorNode(audioContext);
    })
    .catch(function (error) {
        console.error('[web-audio-injector]', error);
    });

/**
 * Handle message from worker thread.
 * @param {MessageEvent} event
 */
worker.onmessage = function (event) {
    const { type, payload } = event.data;

    switch (type) {
        case 'status':
            updateWorkerStatus(payload);
            break;
        default:
            console.warn(
                `[web-audio-injector] Unhandled message type: ${type}`,
            );
            console.log('[web-audio-injector]', event.data);
    }
};

/**
 * Update worker status in the UI.
 * @param {Object} payload
 */
function updateWorkerStatus(payload) {
    function stateToStatus(state) {
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

    state.worker.audioFile = payload.audioFile;
    state.worker.audioSocket = stateToStatus(payload.audioSocket);
    state.worker.dataSocket = stateToStatus(payload.dataSocket);

    render();
}

/**
 * Render the UI.
 */
function render() {
    $('#data-socket').text(state.worker.dataSocket);
    $('#audio-socket').text(state.worker.audioSocket);

    $('#channels').text(state.worker.audioFile.channels);
    $('#sample-rate').text(`${state.worker.audioFile.sampleRate / 1000} kHz`);
    $('#bit-depth').text(state.worker.audioFile.bitDepth);
    $('#frame-count').text(state.worker.audioFile.frameCount);
    $('#buffer-length').text(state.worker.audioFile.bufferLength);
}

$(document).ready(function () {
    render();
});
