import asyncio
from queue import Queue
import sys

from audio_engine import AudioEngine
from web_socket_server import WebSocketServer

from logger import create_logger
logger = create_logger("main")

AUDIO_PORT = 3001
DATA_PORT = 3000


async def main():
    logger.info("starting application")

    if len(sys.argv) < 2:
        logger.error("No audio file argument provided.")
        exit(1)

    audio_engine = AudioEngine(sys.argv[1])

    audio_socket = WebSocketServer(AUDIO_PORT)
    data_socket = WebSocketServer(DATA_PORT)

    data_socket.set_out_queue(audio_engine.queue)

    audio_engine.set_audio_queue(audio_socket.queue)
    audio_engine.set_data_queue(data_socket.queue)

    await asyncio.gather(
        asyncio.to_thread(audio_engine.queue_processor),

        asyncio.to_thread(audio_socket.queue_processor),
        asyncio.to_thread(data_socket.queue_processor),

        asyncio.to_thread(audio_socket.serve),
        asyncio.to_thread(data_socket.serve),

        asyncio.to_thread(audio_engine.run),
    )


if __name__ == "__main__":
    asyncio.run(main())
