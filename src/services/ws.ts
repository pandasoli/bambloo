import type { WSArgs } from '@/models/conn.ts'


export const connect_ws = (args: WSArgs) => new Promise<{ socket: WebSocket, err: string|null }>(resolve => {
	const socket = new WebSocket(`ws://localhost:${args.port}`)

	const onOpen = () => {
		socket.removeEventListener('open', onOpen)
		socket.removeEventListener('close', onClose)
		resolve({ socket, err: null })
	}

	const onClose = () => {
		socket.removeEventListener('open', onOpen)
		socket.removeEventListener('close', onClose)
		resolve({ socket, err: "Couldn't connect to WebSocket server" })
	}

	socket.addEventListener('open', onOpen)
	socket.addEventListener('close', onClose)
})
