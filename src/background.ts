import { get } from 'svelte/store'
import { isConnMethod } from '@/models/conn.ts'
import type { ConnMethod } from '@/models/conn.ts'
import { conn } from '@/stores/conn.ts'
import { popup } from '@/stores/popup.ts'
import { ui } from '@/stores/ui.ts'
import { presences } from '@/stores/presences.ts'
import { updateGlobal } from '@/utils/update_global.ts'
import { try_conn } from '@/services/connect.ts'


chrome.runtime.onMessage.addListener((msg, _, send) => {
	if (msg?.type.startsWith('try')) {
		const method = msg.type.substring('try '.length) as ConnMethod

		try_conn(method, msg.args)
			.then(({ conn: conn_, err }) => {
				if (conn_) conn.change(conn_)
				send(err)
			})

		return true
	}
})

chrome.runtime.onConnect.addListener(async port => {
	updateGlobal(get(conn), 'conn')
	updateGlobal(get(popup), 'popup')
	updateGlobal(get(ui), 'ui')
	updateGlobal(get(presences), 'presences')

	port.onDisconnect.addListener(() => {
		// Store data that is required between connections
		const presences_ = get(presences)
		const conn_ = get(conn)

		const method = conn_?.connected ? conn_.method : null
		const args = conn_?.connected ? conn_.args : null

		// Store data
		const data = {
			conn: { method, args },
			presences: presences_ as string[]|undefined
		}

		// Needed to not overwrite invalid data in storage
		if (!data.presences) delete data.presences

		chrome.storage.local.set(data)
	})
});

// Run on background start
(async () => {
	const { conn: conn_data } = await chrome.storage.local.get('conn')
	const { presences: presences_data } = await chrome.storage.local.get('presences')

	if (conn_data !== undefined && conn_data?.method !== null) {
		if (!isConnMethod(conn_data?.method))
			popup.append('Connection method stored is not valid')
		else {
			const { conn: nconn, err } = await try_conn(conn_data.method, conn_data.args)

			if (nconn) conn.set(nconn)
			else if (err) popup.append(err)
		}
	}

	if (presences_data !== undefined) {
		if (!Array.isArray(presences_data))
			presences.panic(presences_data)
		else
			presences.set(presences_data)
	}
	else
		presences.set([])
})()
