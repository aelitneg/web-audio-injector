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

import socket_server
import web_audio_injector

PORT = 3000

if __name__ == "__main__":
    print("[web-audio-injector] initializing")

    injector = web_audio_injector.WebAudioInjector()

    server = socket_server.SocketServer(injector.handle_message, PORT)
