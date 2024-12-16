import { writable } from 'svelte/store'
import type { Conn } from '@/models/conn.ts'
import { updateGlobal } from '@/utils/update_global.ts'


export type ConnErr = {
	errMsg: string|null
	connected: boolean
}


const state = writable<Conn|null>(null)

const change = (new_conn: Conn) => {
	state.set(new_conn)
	updateGlobal(new_conn, 'conn')
}

const setErr = (err: ConnErr) =>
	state.update(conn => {
		if (!conn) return conn

		conn.connected = err.connected
		conn.errMsg = err.errMsg

		updateGlobal(conn, 'conn')
		return conn
	})

const stop = () =>
	state.update(conn => {
		if (!conn?.connected) return conn

		switch (conn.method) {
			case 'native-messaging':
				conn.port.disconnect()
				break

			case 'ws':
				conn.socket.close()
		}

		updateGlobal(conn, 'conn')
		return conn
	})

chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'conn update')
		state.set(msg.data)
})

export const conn = {
	...state,
	change,
	setErr,
	stop
}
