'use strict';

require('dotenv').config();

const fs = require('fs');
const http = require('http');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

const PORT = parseInt(process.env.WEB_AUDIO_INJECTOR_DEV_SERVER_PORT) || 8080;

/**
 * Returns MIME type for a file based on the extension.
 * @param {String} filename
 */
function getMimeForFile(filename) {
    const ext = filename.substr(filename.lastIndexOf('.'));

    switch (ext) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'text/javascript';
        default:
            return 'text/plain';
    }
}

const server = http
    .createServer(async function (req, res) {
        try {
            // Redirect root to index.html
            const url = req.url !== '/' ? req.url : '/index.html';

            // Serve files from src directory
            const filePath = path.join(__dirname, './src', url);

            const file = await readFileAsync(filePath);

            res.setHeader('Content-Type', getMimeForFile(filePath));
            res.writeHead(200);
            res.end(file);
        } catch (error) {
            res.writeHead(404);
            res.end(JSON.stringify({ message: 'Not Found' }));
        }
    })
    .listen(PORT);

server.on('listening', function () {
    console.log(`[web-audio-injector-client:dev-server] listening on ${PORT}`);
});

server.on('error', function (error) {
    console.log(`[web-audio-injector-client:dev-server] Error: ${error}`);
});
