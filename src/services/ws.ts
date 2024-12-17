import type { WebSocketArgs, ConnDetails } from '@/models/Conn.ts'


type DetailsPromise = Promise<{ details?: ConnDetails, err?: string }>

type Res = {
	socket: WebSocket
	details: DetailsPromise
}


export const connect_ws = (args: WebSocketArgs): Res => {
	const socket = new WebSocket(`ws://localhost:${args.port}`)

	const details: DetailsPromise = new Promise(resolve => {
		const onMessage = (ev: Event) => {
			socket.removeEventListener('message', onMessage)
			socket.removeEventListener('close', onClose)
			const details = JSON.parse((ev as MessageEvent).data) as ConnDetails
			resolve({ details })
		}

		const onClose = () => {
			socket.removeEventListener('open', onMessage)
			socket.removeEventListener('close', onClose)
			resolve({ err: "Couldn't connect to WebSocket server" })
		}

		socket.addEventListener('message', onMessage)
		socket.addEventListener('close', onClose)
	})

	return {socket, details}
}
