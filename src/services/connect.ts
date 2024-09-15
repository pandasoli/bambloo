import { get } from 'svelte/store'
import { conn } from '@/stores/conn.ts'
import type { Conn, ConnMethod, BaseConn } from '@/models/conn.ts'
import { connect_browser } from '@/services/browser.ts'
import { connect_native } from '@/services/native.ts'
import { connect_ws } from '@/services/ws.ts'


export async function try_conn(method: ConnMethod) {
	if (get(conn)?.connected)
		return {err: "There's alredy an open connection"}

	let data: Conn = null
	const base_data: BaseConn = {
		method,
		connected: true,
		errMsg: null
	}

	switch (method) {
		case 'browser': {
			const { ctx, err } = await connect_browser()
			if (err) return {err}
			data = { ...base_data, method: 'browser', ctx }
		} break

		case 'native-messaging': {
			const { port, err } = await connect_native()
			if (err) return {err}
			data = { ...base_data, method: 'native-messaging', port }
		} break

		case 'ws': {
			const { socket, err } = await connect_ws()
			if (err) return {err}
			data = { ...base_data, method: 'ws', socket }
		}
	}

	return {conn: data, err: null}
}
