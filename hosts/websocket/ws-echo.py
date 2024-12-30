import asyncio
import websockets
import json

port = 8765
details = { 'multiple': True }
activities = {}

async def websocket_handler(socket):
	print(f'{socket.remote_address} connected')
	await socket.send(json.dumps(details))

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

					print('tabId', tabId)
					activities[tabId] = activity

				# No need to update on remove because when
				# a tab is removed a new focus event is fired
				# and the presence at Discord is fixed
				case 'remove':
					tabId = data.get('tabId')

					if not tabId: print('No tabId received'); continue

					print('tabId', tabId)
					activities.pop(tabId)

				case 'focus':
					tabId = data.get('tabId')
					activity = activities.get(tabId)

					if not tabId: print('No tabId received'); continue
					if not activity: print('No activity received'); continue

					print('tabId', tabId)

				case _:
					print(f'Not implemented event {event}')

	except websockets.exceptions.ConnectionClosed:
		print(f'{socket.remote_address} closed connection')

async def main():
	# Server starting
	server = await websockets.serve(websocket_handler, 'localhost', port)
	print(f'ws://localhost:{port}')

	await server.wait_closed()

if __name__ == '__main__':
	asyncio.run(main())
