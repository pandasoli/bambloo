import os
import sys
import time
import subprocess
import json
import struct
import uuid
from typing import TypedDict, Optional, Any
from enum import Enum

if sys.platform == 'linux':
	import socket
elif sys.platform == 'win32':
	import win32file
	import win32pipe


# Discord data structures
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

# Library data structures
class ConnectStatus(Enum):
	Connected = 0
	SocketsRetriveError = 1
	NoSockets = 2
	ConnectionError = 3


class StreamString:
	os:     str
	socket: Any

	def __init__(self, os: str, socket: Any):
		self.os = os
		self.socket = socket

	def read_bytes(self) -> tuple[bool, str|None, tuple[int, bytes]|None]:
		try:
			res = self.read_bytes_()
			return (True, None, res)
		except Exception as e:
			return (False, str(e), None)

	def write_bytes(self, data: bytes) -> tuple[bool, str|None]:
		try:
			self.write_bytes_(data)
			return (True, None)
		except Exception as e:
			return (False, str(e))

	def close(self):
		match self.os:
			case 'linux': self.socket.close()
			case 'win32': win32file.CloseHandle(self.socket)

	def read_bytes_(self) -> tuple[int, bytes]:
		raw_metadata: bytes
		buf: bytes

		match self.os:
			case 'linux': raw_metadata = self.socket.recv(8)
			case 'win32': raw_metadata = win32file.ReadFile(self.socket, 8)[1]
			case _: raise Exception('Unsupported system')

		metadata = struct.unpack('<II', raw_metadata)
		size = metadata[1]

		match self.os:
			case 'linux': buf = self.socket.recv(size)
			case 'win32': buf = win32file.ReadFile(self.socket, size)[1]
			case _: raise Exception('Unsupported system')

		return (metadata[0], buf)

	def write_bytes_(self, data: bytes):
		match self.os:
			case 'linux': self.socket.sendall(data)
			case 'win32': win32file.WriteFile(self.socket, data)
			case _: raise Exception('Unsupported system')


class Discord:
	client_id: str
	connected: bool
	os:        str

	socket:    Any
	buf:       StreamString

	def __init__(self, client_id: str):
		self.client_id = client_id
		self.connected = False
		self.os = sys.platform

		if self.os not in ('linux', 'win32'):
			raise Exception('Not supported system')

	def authorize(self) -> tuple[bool, str|None, AuthorizationResponse|Error|None]:
		if not self.connected: return (False, 'Not connected', None)

		payload = {
			'client_id': self.client_id,
			'v': 1
		}

		done, msg, res = self.__call(0, payload)
		if not done:
			self.connected = False
			return (False, msg, None)
		if not res: return (False, msg, None) # Remove |None from res

		_, msg = res
		data = json.loads(msg)

		if 'code' in data: return (False, msg, Error(data))

		return (True, msg, AuthorizationResponse(data))

	def clear_activity(self):
		return self.set_activity(None)

	def set_activity(self, activity: Activity|None) -> tuple[bool, str|None, SetActivityResponse|Error|None]:
		if not self.connected: return (False, 'Not connected', None)

		payload = {
			'cmd': 'SET_ACTIVITY',
			'nonce': str(uuid.uuid4()),
			'args': {
				'activity': activity,
				'pid': os.getpid()
			}
		}

		done, msg, res = self.__call(1, payload)
		if not done:
			self.connected = False
			return (False, msg, None)
		if not res: return (False, msg, None) # Remove |None from res

		_, msg = res
		data = json.loads(msg)

		if 'code' in data: return (False, msg, Error(data))
		if data.get('evt') == 'ERROR': return (False, msg, SetActivityResponse(data))

		return (True, msg, SetActivityResponse(data))

	def connect(self) -> tuple[ConnectStatus, str|None]:
		if self.connected: self.buf.close()

		done, msg, sockets = self.__get_sockets()
		if not done: return (ConnectStatus.SocketsRetriveError, msg)
		if not sockets: return (ConnectStatus.NoSockets, None)

		match self.os:
			case 'linux': self.socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

		for sock in sockets:
			try:
				match self.os:
					case 'linux':
						self.socket.connect(sock)
						self.socket.setblocking(False)

					case 'win32':
						self.socket = win32file.CreateFile(
							sock,
							win32file.GENERIC_READ | win32file.GENERIC_WRITE,
							0, None,
							win32file.OPEN_EXISTING,
							0, None
						)

				self.buf = StreamString(self.os, self.socket)
				self.connected = True
				return (ConnectStatus.Connected, None)
			except: ...

		return (ConnectStatus.ConnectionError, "Couldn't connect to any socket")

	def __get_sockets(self) -> tuple[bool, str|None, list[str]|None]:
		cmd: str

		match self.os:
			case 'linux': cmd = 'ss -lx | grep -o [^[:space:]]*discord[^[:space:]]*'
			case 'win32': cmd = 'powershell -Command (Get-ChildItem \\\\.\\pipe\\).FullName | findstr discord'
			case _: raise Exception('Unsupported system')

		process = subprocess.run(cmd, capture_output=True, text=True, shell=True)
		stdout = process.stdout
		stderr = process.stderr

		if stderr:
			return (False, stderr, None)

		return (True, None, stdout.strip().split('\n'))

	# might throw error
	def __call(self, opcode: int, payload: dict) -> tuple[bool, str|None, tuple[int, str]|None]:
		data = json.dumps(payload)
		msg = struct.pack('<ii', opcode, len(data)) + data.encode()

		done, msg = self.buf.write_bytes(msg)
		if not done: return (False, msg, None)

		time.sleep(2)

		done, msg, res = self.buf.read_bytes()
		if not done: return (False, msg, None)
		if not res: return (False, msg, None)

		opcode = res[0]
		data = res[1].decode()

		return (True, None, (opcode, data))

				# res = b''
				#
				# while True:
				# 	try:
				# 		chunk = self.socket.recv(1024)
				# 		if not chunk: break
				# 		res += chunk
				# 	except BlockingIOError:
				# 		break
				# 	except socket.timeout:
				# 		# Timeout occurred while waiting for data
				# 		break
				#
				# opcode = struct.unpack('<ii', res[:8])[0]
				# msg = res[8:].decode()

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
