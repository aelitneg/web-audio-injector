import asyncio
import json
from queue import Queue
import websockets

from logger import create_logger
logger = create_logger("WebSocketServer")


class WebSocketServer:
    def __init__(self, port):
        self.port = port

        self.queue = Queue()
        self.out_queue = None
        self.processing_queue = False

    def set_out_queue(self, out_queue):
        self.out_queue = out_queue

    def serve(self):
        logger.info("starting websocket server thread")

        self.event_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.event_loop)

        self.server = websockets.serve(self.message_handler, port=self.port)

        asyncio.get_event_loop().run_until_complete(self.server)
        asyncio.get_event_loop().run_forever()

    async def message_handler(self, websocket, path):
        logger.info("client connected")

        self.websocket = websocket

        async for raw_message in self.websocket:
            self.out_queue.put(json.loads(raw_message))

        logger.info("client disconnected")

    async def send_message(self, message):
        await self.websocket.send(json.dumps(message))

    async def send_data(self, data):
        await self.websocket.send(data)

    def queue_processor(self):
        logger.info("listening for messages in queue")
        self.processing_queue = True

        while self.processing_queue:
            message = self.queue.get(block=True)
            if (message["type"] == "data"):
                asyncio.run(self.send_data(message["payload"]))
            else:
                asyncio.run(self.send_message(message))
