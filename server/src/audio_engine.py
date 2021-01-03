from queue import Queue
import wave

from logger import create_logger
logger = create_logger("AudioEngine")

FRAME_BUFFER = 1024


class AudioEngine:
    def __init__(self, audio_file):
        self.running = False
        self.queue = Queue()
        self.processing_queue = False

        self.audio_queue = None
        self.data_queue = None

        logger.info("loading audio file %s", audio_file)
        self.audio_file = wave.open(audio_file)
        logger.debug(self.audio_file.getparams())

    def set_audio_queue(self, audio_queue):
        self.audio_queue = audio_queue

    def set_data_queue(self, data_queue):
        self.data_queue = data_queue

    def run(self):
        self.running = True
        while self.running:
            command = input("Enter a command: ")
            if (command == "play"):
                self.play_audio()
            else:
                logger.warn("Unsupported command: %s", command)

    def play_audio(self):
        logger.info("play audio started")

        self.audio_file.rewind()

        while self.audio_file.tell() < self.audio_file.getnframes():
            self.audio_queue.put(
                {"type": "data", "payload": self.audio_file.readframes(FRAME_BUFFER)})

        logger.info("play audio complete")

    def send_status(self):
        message = {
            "type": "status",
            "payload": {
                "channels": self.audio_file.getnchannels(),
                "sample_rate": self.audio_file.getframerate(),
                "bit_depth": self.audio_file.getsampwidth(),
                "frame_count": self.audio_file.getnframes(),
                "buffer_length": FRAME_BUFFER,
            }
        }

        logger.info("sending status")
        self.data_queue.put(message)

    def queue_processor(self):
        logger.info("listening for messages in queue")
        self.processing_queue = True

        while self.processing_queue:
            message = self.queue.get(block=True)
            logger.debug(message)

            if (message["type"] == 'status'):
                self.send_status()
            else:
                error_message = "Unhandled message type: " + message["type"]
                logger.warn(error_message)
                self.data_queue.put(
                    {"type": "error", "payload": error_message})
