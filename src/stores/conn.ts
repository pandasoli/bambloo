import { get, writable } from 'svelte/store'

import { popup } from '@/stores/popup.ts'

import type { Conn, ConnDetails } from '@/models/Conn.ts'
import { ConnMethod, ConnState } from '@/models/Conn.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'
import { tryset_conn } from '@/utils/tryset_conn.ts'


const state = writable<Conn|null>(null)
set_updatters(state, 'conn')


const onErr = () => {
	setState(ConnState.Stopped)
	setErrMsg('Connection lost')
}


const load = async () => {
	const { conn: data } = await chrome.storage.local.get('conn')
	if (data === undefined) return

	if (typeof data !== 'object') return popup.append('Connection info stored is not valid')

	if (data.method === null) return

	if (typeof data.method !== 'number') return popup.append('Connection method stored is not valid')
	if (typeof data.args !== 'object' && data.args !== null) return popup.append('Connection args stored are not valid')
	if (typeof data.args === 'object' && typeof data.args.port !== 'number') return popup.append('Connection port stored are not valid')

	tryset_conn(data.method, data.args, true)
}

const change = (new_conn: Conn|null) => {
	if (new_conn)
		switch (new_conn.method) {
			case ConnMethod.NativeMessaging:
				new_conn.port.onDisconnect.addListener(onErr)
				break

			case ConnMethod.WebSocket:
				new_conn.socket.addEventListener('open', () => {
					new_conn.socket.addEventListener('close', onErr)
					new_conn.socket.addEventListener('error', onErr)
				})
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
				conn.socket.removeEventListener('error', onErr)
				conn.socket.close()
		}

		return conn
	})

const message = (data: any) => {
	const conn_ = get(conn)

	switch (conn_?.method) {
		case ConnMethod.NativeMessaging:
			console.log(data)
			conn_.port.postMessage(data)
			break

		case ConnMethod.WebSocket:
			conn_.socket.send(JSON.stringify(data))
	}
}


export const conn = {
	...state,
	load,
	change,
	setState,
	setDetails,
	setErrMsg,
	stop,
	message
}
