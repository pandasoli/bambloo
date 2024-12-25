import type { Conn, ConnDetails, ConnArgs, WebSocketArgs, NativeMessagingConn, WebSocketConn } from '@/models/Conn.ts'
import { ConnMethod, ConnState } from '@/models/Conn.ts'

import { connect_native } from '@/services/native.ts'
import { connect_ws } from '@/services/ws.ts'


type Res = {
	conn: Conn
	details: Promise<ConnDetails>
} | {
	conn: Conn
	err: string
}


export const try_conn = async (method: ConnMethod, args: ConnArgs): Promise<Res> => {
	const bconn = {
		method,
		state: ConnState.Connecting,
		details: { multiple: false }
	}

	switch (method) {
		case ConnMethod.NativeMessaging: {
			const { port, details: details_ } = connect_native()
			const conn = {...bconn, port} as NativeMessagingConn
			const res = await details_

			if ('err' in res) return {conn, err: res.err}

			const details = new Promise<ConnDetails>(r => r(res.details))
			return {conn, details}
		}

		case ConnMethod.WebSocket: {
			const res = await connect_ws(args as WebSocketArgs)
			const conn = {...bconn, socket: res.socket, args} as WebSocketConn

			if ('err' in res) return {conn, err: res.err}

			const { details } = res

			return {conn, details}
		}
	}
}
