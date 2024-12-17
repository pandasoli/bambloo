import { writable } from 'svelte/store'

import type { Conn, ConnDetails, NativeMessagingConn, WebSocketConn } from '@/models/Conn.ts'
import { ConnMethod, ConnState } from '@/models/Conn.ts'

import { updateGlobal } from '@/utils/update_global.ts'


const state = writable<Conn|null>(null)

const change = (new_conn: Conn|null) => {
	state.set(new_conn)
	updateGlobal(new_conn, 'conn')
}

const setState = (nstate: ConnState) =>
	state.subscribe(conn => {
		if (!conn) return conn

		conn.state = nstate

		updateGlobal(conn, 'conn')
		return conn
	})

const setDetails = (details: ConnDetails) =>
	state.subscribe(conn => {
		if (!conn) return conn

		conn.details = details

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
	setDetails
}
