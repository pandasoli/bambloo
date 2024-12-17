import { get, writable } from 'svelte/store'

import type { Conn, ConnDetails } from '@/models/Conn.ts'
import { ConnMethod, ConnState } from '@/models/Conn.ts'

import { updateGlobal } from '@/utils/update_global.ts'


const state = writable<Conn|null>(null)


const onErr = () => {
	setState(ConnState.Stopped)
	setErrMsg('Connection lost')
	chrome.runtime.sendMessage({ type: 'conn lost' }) // is it needed?
}


const change = (new_conn: Conn|null) => {
	if (new_conn)
		switch (new_conn.method) {
			case ConnMethod.NativeMessaging:
				new_conn.port.onDisconnect.addListener(onErr)
				break

			case ConnMethod.WebSocket:
				new_conn.socket.addEventListener('open', () =>
					new_conn.socket.addEventListener('close', onErr)
				)
		}

	state.set(new_conn)
	updateGlobal(new_conn, 'conn')
}

const setState = (nstate: ConnState) =>
	state.update(conn => {
		if (!conn) return conn

		conn.state = nstate

		updateGlobal(conn, 'conn')
		return conn
	})

const setDetails = (details: ConnDetails) =>
	state.update(conn => {
		if (!conn) return conn

		conn.details = details

		updateGlobal(conn, 'conn')
		return conn
	})

const setErrMsg = (msg: string) =>
	state.update(conn => {
		if (!conn) return conn

		conn.state = ConnState.Stopped
		conn.errMsg = msg

		updateGlobal(conn, 'conn')
		return conn
	})

const stop = () =>
	state.update(conn => {
		if (!conn) return conn

		conn.state = ConnState.Stopped

		switch (conn.method) {
			case ConnMethod.NativeMessaging:
				conn.port.onDisconnect.removeListener(onErr)
				conn.port.disconnect()
				break

			case ConnMethod.WebSocket:
				conn.socket.removeEventListener('close', onErr)
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
	setState,
	setDetails,
	setErrMsg,
	stop
}
