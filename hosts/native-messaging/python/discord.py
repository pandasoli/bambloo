import os
import sys
import time
import subprocess
import json
import struct
import uuid
from typing import TypedDict, Optional, Any

if sys.platform == 'linux':
	import socket
	from socket import socket as Socket
elif sys.platform == 'win32':
	import win32file
	import win32pipe


class ActivityTimestamps(TypedDict, total=False):
	start: Optional[int]
	end: Optional[int]

class ActivityAssets(TypedDict, total=False):
	large_image: Optional[str]
	large_text: Optional[str]
	small_image: Optional[str]
	small_text: Optional[str]

class ActivityButton(TypedDict):
	label: str
	url: str

class Activity(TypedDict, total=False):
	state: str
	details: str
	timestamps: Optional[ActivityTimestamps]
	assets: ActivityAssets
	buttons: Optional[list[ActivityButton]]

class ResponseActivityMetadata(TypedDict):
	button_urls: list[str]

class ResponseActivity(TypedDict):
	state: str
	details: str
	timestamps: Optional[ActivityTimestamps]
	assets: ActivityAssets
	buttons: list[str]
	name: str
	application_id: str
	type: int
	metadata: ResponseActivityMetadata

class Error(TypedDict):
	code: int
	message: str

class SetActivityResponse(TypedDict):
	cmd: str
	data: Activity | Error
	evt: str
	nonce: str

class AuthorizationResponseDataConfig(TypedDict):
	cdn_host: str
	api_endpoint: str
	environment: str

class AuthorizationResponseDataUser(TypedDict):
	id: str
	username: str
	discriminator: str
	global_name: str
	avatar: str
	avatar_decoration_data: Optional[str]
	bot: bool
	flags: int
	premium_type: int

class AuthorizationResponseData(TypedDict):
	v: int
	config: AuthorizationResponseDataConfig
	user: AuthorizationResponseDataUser

class AuthorizationResponse(TypedDict):
	cmd: str
	data: AuthorizationResponseData
	evt: str
	nonce: Optional[str]


class StreamString:
	def __init__(self, io_stream):
		self.io_stream = io_stream

	def read_bytes(self) -> tuple[int, bytes]:
		raw_metadata = win32file.ReadFile(self.io_stream, 8)[1]
		if isinstance(raw_metadata, str):
			raw_metadata = raw_metadata.encode()

		metadata = struct.unpack('<II', raw_metadata)
		size = metadata[1]

		buf = win32file.ReadFile(self.io_stream, size)[1]
		if isinstance(buf, str):
			buf = buf.encode()

		return (metadata[0], buf)

	def write_bytes(self, data: bytes):
		win32file.WriteFile(self.io_stream, data)


class Discord:
	client_id:        str
	tried_connection: bool
	os:               str

	# For Linux
	socket:           Any # Socket is undefined on Windows

	# For Windows
	pipe:             Any
	buf:              StreamString

	def __init__(self, client_id: str):
		self.client_id = client_id
		self.os = sys.platform

		if self.os not in ('linux', 'win32'):
			raise Exception('Not supported system')

	def authorize(self) -> tuple[bool, str, AuthorizationResponse|Error|None]:
		payload = {
			'client_id': self.client_id,
			'v': 1
		}

		try:
			_, msg = self.call(0, payload)
			data = json.loads(msg)

			if 'code' in data: return (False, msg, Error(data))

			return (True, msg, AuthorizationResponse(data))
		except socket.error as e:
			return (False, str(e), None)

	def clear_activity(self):
		return self.set_activity(None)

	def set_activity(self, activity: Activity|None) -> tuple[bool, str, SetActivityResponse|Error|None]:
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
			data = json.loads(msg)

			if 'code' in data: return (False, msg, Error(data))
			if data.get('evt') == 'ERROR': return (False, msg, SetActivityResponse(data))

			return (True, msg, SetActivityResponse(data))
		except socket.error as e:
			return (False, str(e), None)

	def connect(self) -> tuple[bool, str|None]:
		success, sockets, msg = self.get_sockets()
		if not success: return (False, msg)
		if not sockets: return (False, 'No sockets')

		match self.os:
			case 'linux': self.socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

		for sock in sockets:
			try:
				match self.os:
					case 'linux':
						self.socket.connect(sock)
						self.socket.setblocking(False)
						return (True, None)

					case 'win32':
						self.pipe = win32file.CreateFile(
							sock,
							win32file.GENERIC_READ | win32file.GENERIC_WRITE,
							0,
							None,
							win32file.OPEN_EXISTING,
							0,
							None
						)

						self.buf = StreamString(self.pipe)
						return (True, None)
			except:
				self.socket.close()

		return (False, "Couldn't connect to any socket")

	def get_sockets(self) -> tuple[bool, list[str]|None, str|None]:
		cmd = ''

		match self.os:
			case 'linux': cmd = 'ss -lx | grep -o [^[:space:]]*discord[^[:space:]]*'
			case 'win32': cmd = 'powershell -Command (Get-ChildItem \\\\.\\pipe\\).FullName | findstr discord'

		process = subprocess.run(cmd, capture_output=True, text=True, shell=True)
		stdout = process.stdout
		# stderr = process.stderr

		return (True, stdout.strip().split('\n'), None)

	# might throw error
	def call(self, opcode: int, payload: dict) -> tuple[int, str]:
		data = json.dumps(payload)
		msg = struct.pack('<ii', opcode, len(data)) + data.encode()

		match self.os:
			case 'linux': self.socket.sendall(msg)
			case 'win32': self.buf.write_bytes(msg)

		time.sleep(2)
		msg = ''
		opcode = 0

		match self.os:
			case 'linux':
				res = b''

				while True:
					try:
						chunk = self.socket.recv(1024)
						if not chunk: break
						res += chunk
					except BlockingIOError:
						break
					except socket.timeout:
						# Timeout occurred while waiting for data
						break

				opcode = struct.unpack('<ii', res[:8])[0]
				msg = res[8:].decode()

			case 'win32':
				opcode, res = self.buf.read_bytes()
				msg = res.decode()

		return (opcode, msg)


if __name__ == '__main__':
	discord = Discord('1059272441194623126')
	connected = discord.connect()

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
