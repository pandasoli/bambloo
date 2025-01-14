import { conn } from '@/stores/conn.ts'

import { ConnMethod, ConnState } from '@/models/Conn.ts'
import type { ConnArgs } from '@/models/Conn.ts'

import { try_conn } from '@/services/connect.ts'


/**
 * Attempts to establish a new connection. If establish and a
 * connection is already active, it disconnects the current
 * one before replacing it with the newly connection.
 */
export const tryset_conn = (method: ConnMethod, args: ConnArgs, callback?: (err?: string) => void) => {
	try_conn(method, args).then(res => {
		const { conn: conn_ } = res

		if ('err' in res)
			return callback?.(res.err)

		browser.runtime.sendMessage({type: 'conn state update', state: ConnState.WaitingDetails})

		res.details.then(details => {
			conn.stop()
			conn.change(conn_)
			conn.setDetails(details)
			conn.setState(ConnState.Connected)

			browser.runtime.sendMessage({type: 'conn state update', state: ConnState.Connected})
			callback?.()
		})
	})
}

