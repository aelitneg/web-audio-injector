'use strict';

console.log('[web-audio-injector] initializing');

/**
 * Application state
 */
const state = {
    worker: {
        connected: false,
    },
};

/**
 * Worker thread
 */
const worker = new Worker('/worker.js');

/**
 * Handle message from worker thread.
 * @param {MessageEvent} event
 */
worker.onmessage = function (event) {
    const { type, payload } = event.data;
    switch (type) {
        case 'status':
            updateWorkerState(payload);
            break;
        default:
            console.error('Unhandled message type: ' + type);
    }
};

/**
 * Update the state for the worker.
 * @param {Object} status
 */
function updateWorkerState(status) {
    state.worker.connected = status.is_client_connected;
    render();
}

/**
 * Render the UI.
 */
function render() {
    $('#worker-connected').text(state.worker.connected);
}

$(document).ready(function () {
    render();
});
