# web-audio-injector

Stream audio into Web Audio API context from Python

⚠️ **WORK IN PROGRESS** ⚠️

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
