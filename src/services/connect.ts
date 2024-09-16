import { get } from 'svelte/store'
import { conn } from '@/stores/conn.ts'
import type { Conn, ConnMethod, BaseConn, ConnArgs, BrowserArgs, WSArgs, BrowserConn, WSConn } from '@/models/conn.ts'
import { connect_browser } from '@/services/browser.ts'
import { connect_native } from '@/services/native.ts'
import { connect_ws } from '@/services/ws.ts'


// maybe a function overload here?
export async function try_conn(method: ConnMethod, args: ConnArgs) {
	if (get(conn)?.connected)
		return {err: "There's alredy an open connection"}

	let nconn: Conn
	const base_data: BaseConn = {
		method,
		connected: true,
		errMsg: null,
		args: null
	}

	switch (method) {
		case 'browser': {
			const { ctx, err } = await connect_browser(args as BrowserArgs)
			if (err) return {err}
			nconn = {...base_data, ctx, args} as BrowserConn
		} break

		case 'native-messaging': {
			const { port, err } = await connect_native()
			if (err) return {err}
			nconn = {...base_data, method, port}
		} break

		case 'ws': {
			const { socket, err } = await connect_ws(args as WSArgs)
			if (err) return {err}
			nconn = {...base_data, socket, args} as WSConn
		}
	}

	return {conn: nconn, err: null}
}
