'use strict';

console.log('[web-audio-injector:worker] initializing');

const audioFile = {
    channels: 0,
    sampleRate: 0,
    bitDepth: 0,
    frameCount: 0,
    bufferLength: 0,
};

const dataSocket = new WebSocket('ws://localhost:3000');
const audioSocket = new WebSocket('ws://localhost:3001');

dataSocket.onmessage = handleMessage;
audioSocket.onmessage = handleAudio;

dataSocket.onopen = function () {
    console.log('[web-audio-injector:worker] dataSocket opened');
    sendMessage({ type: 'status' });
    updateStatus();
};

dataSocket.onclose = function () {
    console.log('[web-audio-injector:worker] dataSocket closed');
    updateStatus();
};

audioSocket.onopen = function () {
    console.log('[web-audio-injector:worker] audioSocket opened');
    updateStatus();
};

audioSocket.onclose = function () {
    console.log('[web-audio-injector:worker] audioSocket closed');
    updateStatus();
};

/**
 * Handle message from dataSocket.
 * @param {MessageEvent} event
 */
function handleMessage(event) {
    const { type, payload } = JSON.parse(event.data);

    switch (type) {
        case 'status':
            parseStatus(payload);
            break;
        default:
            postMessage(JSON.parse(event.data));
    }
}

let frames = 0;
/**
 * Handle audio data from audioSocket.
 * @param {MessageEvent} event
 */
function handleAudio(event) {
    if (frames == 0) {
        console.log('[web-audio-injector:worker] receiving audio...');
    }

    frames++;

    if (frames == audioFile.frameCount) {
        console.log('[web-audio-injector] finished receiving audio!');
    }
}

function parseStatus(payload) {
    audioFile.channels = payload.channels;
    audioFile.sampleRate = payload.sample_rate;
    audioFile.bitDepth = payload.bit_depth * 8;
    audioFile.frameCount = payload.frame_count;
    audioFile.bufferLength = payload.buffer_length;

    updateStatus();
}

/**
 * Send status update to the UI thread.
 */
function updateStatus() {
    postMessage({
        type: 'status',
        payload: {
            audioFile,
            dataSocket: dataSocket.readyState,
            audioSocket: audioSocket.readyState,
        },
    });
}

/**
 * Send message over te WebSocket.
 * @param {Object} msg
 */
function sendMessage(msg) {
    console.log('[web-audio-injector:worker] sending message', msg);
    dataSocket.send(JSON.stringify(msg));
}
