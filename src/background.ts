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

		let conn_method = conn_?.connected
			? conn_.method
			: null

		let conn_args = conn_?.connected
			? conn_.args
			: null

		// Store data
		const data = {
			conn_method,
			conn_args,
			presences: presences_ as string[]|undefined
		}

		// Needed to not overwrite invalid data in storage
		if (!data.presences) delete data.presences

		chrome.storage.local.set(data)
	})
});

// Run on background start
(async () => {
	const { conn_method } = await chrome.storage.local.get('conn_method')
	const { conn_args } = await chrome.storage.local.get('conn_args')
	const { presences: presences_ } = await chrome.storage.local.get('presences')

	if (!isConnMethod(conn_method))
		popup.append('Connection method store is not valid')
	else {
		const { conn: conn_, err } = await try_conn(conn_method, conn_args)

		if (conn_) conn.set(conn_)
		else if (err) popup.append(err)
	}

	if (!Array.isArray(presences_))
		popup.append('Presences object is not of valid type')
	else
		presences.set(presences_)
})()
