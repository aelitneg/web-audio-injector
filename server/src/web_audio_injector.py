"""
WebAudioInjector

This is the main application class. It maintains the state of the 
application, loads the audio file, parses incoming messages from the 
SocketServer, and streams the audio over the socket connection when 
playback is started. 
"""

import json
import wave


class WebAudioInjector:
    def __init__(self, audio_file):
        self.is_audio_loaded = False
        self.is_client_connected = False
        self.ws_client = None

        self.load_audio_file(audio_file)

    def load_audio_file(self, audio_file):
        print("[web-audio-injector] loading audio file:", audio_file)

        self.audio_file = wave.open(audio_file, mode='rb')
        print("[web-audio-injector]", self.audio_file.getparams())

        self.audioFile_loaded = True

    async def handle_message(self, websocket, path):
        """
        Callback for the websocket server. Executes for each message.

        :param websocket: the websocket instance
        :param path: path of the websocket message
        """
        msg = json.loads(await websocket.recv())
        print("[web-audio-injector] received message", msg)

        msg_type = msg.get("type")

        if (msg_type == "connect"):
            self.connect(websocket)
            await self.send_status(websocket)
        elif (msg_type == "status"):
            await self.send_status(websocket)

    def connect(self, websocket):
        """
        Handle a client connection by storing the connection for 
        later use and setting flags. 
        """
        self.ws_client = websocket
        self.is_client_connected = True

        print("[web-audio-injector] client connected")

    async def send_status(self, websocket):
        """
        Builds and sends a status message to the client. 

        :param websocket: the websocket instance
        """
        print("[web-audio-injector] sending status")

        msg = json.dumps({
            "type": "status",
            "payload": {
                "is_audio_loaded": self.is_audio_loaded,
                "is_client_connected": self.is_client_connected
            }
        })

        await websocket.send(msg)
