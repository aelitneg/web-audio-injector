import logging


def create_logger(name):
    logger = logging.getLogger(name)

    logger.setLevel(logging.DEBUG)

    stream_handler = logging.StreamHandler()

    stream_formatter = logging.Formatter(
        '%(asctime)s [%(name)s] %(levelname)s %(message)s')
    stream_handler.setFormatter(stream_formatter)

    logger.addHandler(stream_handler)

    return logger
