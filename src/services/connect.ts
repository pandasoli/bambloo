import { get } from 'svelte/store'
import { conn } from '@/stores/conn.ts'
import type { Conn, ConnMethod, BaseConn, ConnArgs } from '@/models/conn.ts'
import type { BrowserArgs, WSArgs } from '@/models/conn.ts'
import { connect_browser } from '@/services/browser.ts'
import { connect_native } from '@/services/native.ts'
import { connect_ws } from '@/services/ws.ts'


export async function try_conn(method: ConnMethod, args: ConnArgs) {
	if (get(conn)?.connected)
		return {err: "There's alredy an open connection"}

	let nconn: Conn = null
	const base_data: BaseConn = {
		method,
		connected: true,
		errMsg: null
	}

	switch (method) {
		case 'browser': {
			const { ctx, err } = await connect_browser(args as BrowserArgs)
			if (err) return {err}
			nconn = { ...base_data,
				method: 'browser',
				ctx,
				args: args as BrowserArgs
			}
		} break

		case 'native-messaging': {
			const { port, err } = await connect_native()
			if (err) return {err}
			nconn = { ...base_data, method: 'native-messaging', port }
		} break

		case 'ws': {
			const { socket, err } = await connect_ws(args as WSArgs)
			if (err) return {err}
			nconn = { ...base_data,
				method: 'ws',
				socket,
				args: args as WSArgs
			}
		}
	}

	return {conn: nconn, err: null}
}
