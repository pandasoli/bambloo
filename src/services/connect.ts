import type { Conn, ConnDetails, ConnArgs, WebSocketArgs, NativeMessagingConn, WebSocketConn } from '@/models/Conn.ts'
import { ConnMethod, ConnState } from '@/models/Conn.ts'

import { connect_native } from '@/services/native.ts'
import { connect_ws } from '@/services/ws.ts'


type DetailsPromise = Promise<{ details?: ConnDetails, err?: string }>
type Res = { conn: Conn, details: DetailsPromise }


// maybe a function overload here?
export function try_conn(method: ConnMethod, args: ConnArgs): Res {
	const bconn = {
		method,
		state: ConnState.WaitingDetails,
		details: { multiple: false }
	}

	switch (method) {
		case ConnMethod.NativeMessaging: {
			const { port, details } = connect_native()

			const conn = {...bconn, port} as NativeMessagingConn
			return {conn, details}
		}

		case ConnMethod.WebSocket: {
			const { socket, details } = connect_ws(args as WebSocketArgs)

			const conn = {...bconn, socket, args} as WebSocketConn
			return {conn, details}
		}
	}
}
