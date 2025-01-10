#!/usr/bin/env python3

import struct
import json
from logger           import logger
from sys			        import stdout, stdin, exit
from threading        import Thread
from discord          import Discord, Activity

discord = Discord('1321929356599365644')
details = { 'multiple': False }
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
	logger.info('Waiting for messages')
	focusedId: int = 0

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

				success, msg, _ = discord.set_activity(Activity(activity))
				if not success: send(msg)

			# No need to update on remove because when
			# a tab is removed a new focus event is fired
			# and the presence at Discord is fixed
			case 'remove':
				tabId = data.get('tabId')

				if not tabId: error('No tabId received'); continue

				activities.pop(tabId)

				if focusedId == tabId:
					success, msg, _ = discord.clear_activity()
					if not success: send(msg)

			# This event is fired when a tab is reopened
			# and no tabId is received, there's no problem
			# because an update event is fired thereafter
			case 'focus':
				tabId = data.get('tabId')
				activity = activities.get(tabId)

				if not tabId: error('No tabId received'); continue
				if not activity: error(f'No activity received tabId:{tabId}'); continue

				focusedId = tabId

				success, msg, _ = discord.set_activity(Activity(activity))
				if not success: send(msg)

			case _:
				error(f'Not implemented event')

def setup():
	connected, err = discord.connect()
	if not connected: return error(f"Couldn't connect: {err}")

	authorized, err, _ = discord.authorize()
	if not authorized: return error(f"Couldn't authorize: {err}")

	send(details)
	read()

if __name__ == '__main__':
	th = Thread(target=setup)
	th.start()
	th.join()
	exit(0)
