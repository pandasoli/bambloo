import socket
import os
import time
import subprocess
import json
import struct
import uuid
from typing import TypedDict, NotRequired
from socket import socket as Socket


class PresenceTimestamps(TypedDict):
	start: NotRequired[int]
	end: NotRequired[int]

class PresenceAssets(TypedDict):
	large_image: NotRequired[str]
	large_text:  NotRequired[str]
	small_image: NotRequired[str]
	small_text:  NotRequired[str]

class PresenceButton(TypedDict):
	label: str
	url:   str

class Activity(TypedDict):
	state:      NotRequired[str]
	details:    NotRequired[str]
	timestamps: NotRequired[PresenceTimestamps]
	assets:     PresenceAssets
	buttons:    NotRequired[list[PresenceButton]]


class Discord:
	client_id:        str
	socket:           Socket
	tried_connection: bool

	def __init__(self, client_id: str):
		self.client_id = client_id

	def authorize(self) -> bool:
		payload = {
			'client_id': self.client_id,
			'v': 1
		}

		try:
			opcode, msg = self.call(0, payload)
			print(opcode, msg)
		except socket.error as e:
			print(f'Error authorizing: {e}')
			return False

		return True

	def clear_activity(self):
		return self.set_activity(None)

	def set_activity(self, activity: Activity|None):
		payload = {
			'cmd': 'SET_ACTIVITY',
			'nonce': str(uuid.uuid4()),
			'args': {
				'activity': activity,
				'pid': os.getpid()
			}
		}

		try:
			_, msg = self.call(1, payload)

			msg = json.loads(msg)
			data: dict = msg['data']

			if not data:
				return print('[discord:set_activity] No data', msg)

			code = data.get('code')
			msg = data.get('msg')

			if code:
				print('[discord:set_activity]', code, msg)
		except socket.error as e:
			print(f'Error setting activity: {e}')

	def test_sockets(self) -> bool:
		sockets = self.get_sockets()
		if not sockets: return False

		self.socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

		for i, sock in enumerate(sockets):
			try:
				self.socket.connect(sock)
				self.socket.setblocking(False)
				return True
			except:
				self.socket.close()

				if i == len(sockets) - 1:
					print(f'[Discord:test_sockets] Could not connect to any socket ({len(sockets)})')

		return False

	def get_sockets(self) -> list[str]|None:
		cmd = 'ss -lx'
		grep = 'grep -o [^[:space:]]*discord[^[:space:]]*'

		try:
			process1 = subprocess.Popen(cmd.split(' '), stdout=subprocess.PIPE)
			process2 = subprocess.Popen(grep.split(' '), stdin=process1.stdout, stdout=subprocess.PIPE, text=True)

			output, _ = process2.communicate()

			return output.strip().split('\n')
		except Exception as e:
			print(f'Error getting sockets: {e}')

	# might throw error
	def call(self, opcode: int, payload: dict) -> tuple[int, str]:
		data = json.dumps(payload)
		msg = struct.pack('<ii', opcode, len(data)) + data.encode()

		self.socket.sendall(msg)
		time.sleep(2)

		res = b''

		while True:
			try:
				chunk = self.socket.recv(1024)
				if not chunk: break
				res += chunk
			except BlockingIOError:
				break
			except socket.timeout:
				print('Timeout occurred while waiting for data')
				break

		op_code = struct.unpack('<ii', res[:8])[0]
		msg = res[8:].decode()

		return (op_code, str(msg))


if __name__ == '__main__':
	discord = Discord('1059272441194623126')
	connected = discord.test_sockets()

	if not connected: print('Not connected')
	else:
		print('Connected')

		authorized = discord.authorize()
		if not authorized: print('Not authorized')
		else:
			print('Authorized')

			activity: Activity = {
				'state': 'Some state',
				'details': 'Some details',
				'assets': {
					'large_image': 'https://logowik.com/content/uploads/images/t_283_wikipedia.jpg'
				}
			}

			discord.set_activity(activity)
			print('Set activity')
			input()

			discord.clear_activity()
			print('Set activity')
			input()
