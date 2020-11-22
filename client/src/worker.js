'use strict';

console.log('[web-audio-injector:worker] initializing');

const webSocket = new WebSocket('ws://localhost:3000');

webSocket.onmessage = handleMessage;

webSocket.onopen = function () {
    sendMessage({ type: 'connect' });
};

/**
 * Handle message from the main thread.
 * @param {MessageEvent} event
 */
onmessage = function (event) {
    const { type, payload } = event.data;

    switch (type) {
        default:
            console.error(
                '[web-audio-injector:worker] Unhandled message type: ' + type,
            );
    }
};

/**
 * Handle message from the WebSocket.
 * @param {MessageEvent} event
 */
function handleMessage(event) {
    const { type, payload } = JSON.parse(event.data);

    switch (type) {
        case 'status':
            postMessage({ type: 'status', payload });
            break;
        default:
            console.error(
                '[web-audio-injector:worker] Unhandled message type: ' + type,
            );
    }
}

/**
 * Send message over te WebSocket.
 * @param {Object} msg
 */
function sendMessage(msg) {
    webSocket.send(JSON.stringify(msg));
}
