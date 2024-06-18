
export const connect_ws = () => new Promise<{ socket: WebSocket, err: string|null }>(resolve => {
	const socket = new WebSocket('ws://localhost:8765')

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

