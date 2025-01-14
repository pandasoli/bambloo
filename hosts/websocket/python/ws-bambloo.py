import asyncio
import websockets
import argparse
import json
from discord import ConnectStatus, Discord, Activity

discord: Discord
connectionMsg: dict = {}
port = 8765
details = { 'multiple': True }
activities = {}
test_mode: bool = False


async def send(socket, data):
	if socket:
		msg = json.dumps(data)
		await socket.send(msg)
	else:
		print(data)

async def set_activity(socket, activity: Activity|None):
	global discord, connectionMsg

	done, msg, res = discord.set_activity(activity)
	if not done:
		if not res:
			connectionMsg = { 'type': 'err', 'event': 'connection', 'msg': msg }
			await send(socket, connectionMsg)
		else:
			await send(socket, { 'type': 'err', 'event': 'setting activity', 'msg': msg })

async def connect(socket):
	global discord, connectionMsg
	discord = Discord('1321929356599365644')

	status, msg = discord.connect()
	if status != ConnectStatus.Connected:
		connectionMsg = { 'type': 'err', 'event': 'connection', 'msg': msg }
		return await send(socket, connectionMsg)

	done, msg, _ = discord.authorize()
	if not done:
		connectionMsg = { 'type': 'err', 'event': 'authorization', 'msg': msg }
		return await send(socket, connectionMsg)

	connectionMsg = { 'type': 'info', 'event': 'connected', 'msg': msg }
	await send(socket, connectionMsg)

async def handler(socket):
	print(f'{socket.remote_address} connected')
	await send(socket, details)
	await send(socket, connectionMsg)

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
						await set_activity(socket, Activity(activity))
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
							await set_activity(socket, None)
					else:
						print('tabId', tabId)

				case 'focus':
					tabId = data.get('tabId')
					activity = activities.get(tabId)

					if not tabId: print('No tabId received'); continue
					if not activity: print('No activity received'); continue

					focusedId = tabId

					if not test_mode:
						await set_activity(socket, Activity(activity))
					else:
						print('tabId', tabId)

				case 'reconnect':
					await connect(socket)

				case _:
					print(f'Not implemented event {event}')

	except websockets.exceptions.ConnectionClosed:
		print(f'{socket.remote_address} closed connection')

async def main():
	await connect(None)

	server = await websockets.serve(handler, 'localhost', port)
	print(f'ws://localhost:{port}')

	await server.wait_closed()

if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('--test', action='store_true', help='Run the program in test mode')
	args = parser.parse_args()

	test_mode = args.test

	asyncio.run(main())
