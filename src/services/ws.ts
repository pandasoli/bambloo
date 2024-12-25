import type { WebSocketArgs, ConnDetails } from '@/models/Conn.ts'


type Res = {
	socket: WebSocket
	details: Promise<ConnDetails>
} | {
	socket: WebSocket
	err: string
}


export const connect_ws = (args: WebSocketArgs) => new Promise<Res>(resolve => {
	const socket = new WebSocket(`ws://localhost:${args.port}`)

	const details = () => new Promise<ConnDetails>(resolve => {
		const onMessage = (ev: MessageEvent) => {
			socket.removeEventListener('message', onMessage)
			const details = JSON.parse(ev.data)
			resolve(details)
		}

		socket.addEventListener('message', onMessage)
	})

	const onErr = () =>
		resolve({socket, err: 'Connection failed'})

	const onOpen = () => {
		socket.removeEventListener('error', onErr)
		resolve({ socket, details: details() })
	}

	socket.addEventListener('open', onOpen)
	socket.addEventListener('error', onErr)
})
