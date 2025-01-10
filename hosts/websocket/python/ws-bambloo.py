import asyncio
import websockets
import argparse
import json
from discord import Discord, Activity

discord: Discord
port = 8765
details = { 'multiple': True }
activities = {}
test_mode: bool = False


async def websocket_handler(socket):
	print(f'{socket.remote_address} connected')
	await socket.send(json.dumps(details))

	focusedId: int = 0

	try:
		async for msg in socket:
			data: dict = json.loads(msg)
			event = data.get('event')

			if not event: print('No event received'); continue

			print(f'\033[1;33m{event}\033[m')

			match event:
				case 'update':
					tabId = data.get('tabId')
					activity = data.get('activity')

					if not tabId: print('No tabId received'); continue
					if not activity: print('No activity received'); continue

					focusedId = tabId
					activities[tabId] = activity

					if not test_mode:
						discord.set_activity(Activity(activity))
					else:
						print('tabId', tabId)

				# No need to update on remove because when
				# a tab is removed a new focus event is fired
				# and the presence at Discord is fixed
				case 'remove':
					tabId = data.get('tabId')

					if not tabId: print('No tabId received'); continue

					activities.pop(tabId)

					if not test_mode:
						if focusedId == tabId:
							discord.clear_activity()
					else:
						print('tabId', tabId)

				case 'focus':
					tabId = data.get('tabId')
					activity = activities.get(tabId)

					if not tabId: print('No tabId received'); continue
					if not activity: print('No activity received'); continue

					focusedId = tabId

					if not test_mode:
						discord.set_activity(Activity(activity))
					else:
						print('tabId', tabId)

				case _:
					print(f'Not implemented event {event}')

	except websockets.exceptions.ConnectionClosed:
		print(f'{socket.remote_address} closed connection')

async def main():
	# Discord connection
	if not test_mode:
		discord = Discord('1321929356599365644')

		connected = discord.connect()
		if not connected: return print('Not connected')

		authorized = discord.authorize()
		if not authorized: return print('Unauthozied')

	# Server starting
	server = await websockets.serve(websocket_handler, 'localhost', port)
	print(f'ws://localhost:{port}')

	await server.wait_closed()

if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('--test', action='store_true', help='Run the program in test mode')
	args = parser.parse_args()

	test_mode = args.test

	asyncio.run(main())
