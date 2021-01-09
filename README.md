# web-audio-injector

Stream audio into Web Audio API context from Python

🛑 **FAILED PROTOTYPE** 🛑

### Reasons for abandonment: 
- Fixed length `SharedArrayBuffer` requires use of blocking `Atomic.wait()`. This prevents processing of `WebSocket` data on the worker thread. 
- Lack of mobile browser support for `SharedArrayBuffer` 

## Overview

- This project contains two main components, a Python server and a Javascript client
- Python Server
    - Loads an audio file into memory
    - Listens for Web Socket connections from the client
    - Prompts the user to start the playback stream to the client
- Javascript Client
    - Initializes a Web Audio API context
    - Starts a Web Socket connection to the server
    - Waits for playback stream from server
    - Injects the playback stream into the Web Audio API context and plays the audio in the browser

This project is a proof of concept. Contributors welcome.
