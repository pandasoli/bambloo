import { writable } from 'svelte/store'

import type { Conn, ConnDetails } from '@/models/Conn.ts'
import { ConnMethod, ConnState } from '@/models/Conn.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'


const state = writable<Conn|null>(null)
set_updatters(state, 'conn')


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
}

const setState = (nstate: ConnState) =>
	state.update(conn => {
		if (!conn) return conn

		conn.state = nstate

		return conn
	})

const setDetails = (details: ConnDetails) =>
	state.update(conn => {
		if (!conn) return conn

		conn.details = details

		return conn
	})

const setErrMsg = (msg: string) =>
	state.update(conn => {
		if (!conn) return conn

		conn.state = ConnState.Stopped
		conn.errMsg = msg

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

		return conn
	})


export const conn = {
	...state,
	change,
	setState,
	setDetails,
	setErrMsg,
	stop
}
