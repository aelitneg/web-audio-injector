"""
SocketServer 

The SocketServer is a simple wrapper around websockets. It starts a
serer listening on the port and registers a handler for incoming
messages
"""

import asyncio
import websockets


class SocketServer:
    def __init__(self, message_handler, port):
        """
        Starts a websocket server listening on the specified port.

        :param message_handler: callback function to handle incoming messages
        :param port: port
        """
        self.server = websockets.serve(message_handler, port=port)
        print("[web-audio-injector:socket_server] listening on", port)

        asyncio.get_event_loop().run_until_complete(self.server)
        asyncio.get_event_loop().run_forever()
