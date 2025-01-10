import logging


class ColoredFormatter(logging.Formatter):
	def __init__(self, fmt, datefmt=None):
		super().__init__(fmt, datefmt)
		self.fmt = fmt

	def format(self, record):
		match record.levelno:
			case logging.INFO:
				record.levelname = f'\033[32m{record.levelname}\033[m'
			case logging.WARNING:
				record.levelname = f'\033[33m{record.levelname}\033[m'
			case logging.ERROR:
				record.levelname = f'\033[31m{record.levelname}\033[m'
			case logging.DEBUG:
				record.levelname = f'\033[36m{record.levelname}\033[m'

		return super().format(record)


formatter = ColoredFormatter(
	fmt='%(asctime)s %(levelname)s: %(message)s',
	datefmt='%H:%M:%S'
)

file_handler = logging.FileHandler('bambloo-natmsg-host.log')
file_handler.setFormatter(formatter)

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
logger.addHandler(file_handler)
