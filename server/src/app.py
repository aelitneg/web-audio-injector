"""
Web Audio Injector - Server

The Web Audio Injector Server performs two main functions: 
- Loads an audio file into memory
- Stream the audio file to the client over the Web Socket 
connection

This is the main entry point for the application. It creates an 
instance of the WebAudioInjector class, starts a SocketServer 
listening on the specified PORT. The server calls the injector
callback for each message. 
"""
import sys

import socket_server
import web_audio_injector

PORT = 3000

if __name__ == "__main__":
    print("[web-audio-injector] initializing")

    if len(sys.argv) != 2:
        print("Usage: python ./app.py audioFile.wav")
        exit()

    injector = web_audio_injector.WebAudioInjector(sys.argv[1])

server = socket_server.SocketServer(injector.handle_message, PORT)
