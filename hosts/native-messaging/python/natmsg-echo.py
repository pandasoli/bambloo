#!/usr/bin/env python3

import struct
import json
from logger           import logger
from sys			        import stdout, stdin, exit
from threading        import Thread

details = { 'multiple': True }
activities = {}


def send(msg):
	data = json.dumps(msg)
	stdout.buffer.write(struct.pack('I', len(data)))
	stdout.write(data)
	stdout.flush()

def error(msg: str):
	send(msg)
	logger.error(msg)

def read():
	while True:
		# Processing received data
		text_len_bytes: bytes = stdin.buffer.read(4)

		if len(text_len_bytes) == 0:
			send('Exiting')
			break

		text_len: int = struct.unpack('@I', text_len_bytes)[0]
		text = stdin.buffer.read(text_len).decode('utf-8')

		# Using data
		data: dict = json.loads(text)
		event = data.get('event')

		if not event: error('No event received'); continue

		logger.info(f'\033[1;33m{event}\033[m')

		match event:
			case 'update':
				tabId = data.get('tabId')
				activity = data.get('activity')

				if not tabId: error('No tabId received'); continue
				if not activity: error(f'No activity received tabId:{tabId}'); continue

				activities[tabId] = activity

				logger.debug('tabId', tabId)

			# No need to update on remove because when
			# a tab is removed a new focus event is fired
			# and the presence at Discord is fixed
			case 'remove':
				tabId = data.get('tabId')

				if not tabId: error('No tabId received'); continue

				activities.pop(tabId)

				logger.debug('tabId', tabId)

			# This event is fired when a tab is reopened
			# and no tabId is received, there's no problem
			# because an update event is fired thereafter
			case 'focus':
				tabId = data.get('tabId')
				activity = activities.get(tabId)

				if not tabId: error('No tabId received'); continue
				if not activity: error(f'No activity received tabId:{tabId}'); continue

				logger.debug('tabId', tabId)

			case _:
				error(f'Not implemented event')

def setup():
	send(details)
	read()

if __name__ == '__main__':
	th = Thread(target=read)
	th.start()
	th.join()
	exit(0)
