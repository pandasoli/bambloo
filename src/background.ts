import { get } from 'svelte/store'
import { isConnMethod } from '@/models/conn.ts'
import type { ConnMethod } from '@/models/conn.ts'
import { conn } from '@/stores/conn.ts'
import { popup } from '@/stores/popup.ts'
import { ui } from '@/stores/ui.ts'
import { updateGlobal } from '@/utils/update_global.ts'
import { try_conn } from '@/services/connect.ts'


chrome.runtime.onMessage.addListener((msg, _, send) => {
	if (msg?.startsWith?.('try')) {
		const method = msg.substring(4) as ConnMethod

		try_conn(method)
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

	port.onDisconnect.addListener(() => {
		/// popup message isn't required between connections
		/// So no need to store it

		const conn_ = get(conn)
		let conn_method = conn_?.connected
			? conn_.method
			: null

		const data = { conn_method }

		chrome.storage.local.set(data)
	})
});

// Run on background start
(async () => {
	const { conn_method } = await chrome.storage.local.get('conn_method')

	if (!isConnMethod(conn_method))
		popup.set('Connection method store is not valid')
	else {
		//const { conn: conn_, err } = await try_conn(conn_method)
		//
		//if (conn_) conn.set(conn_)
		//else popup.set(err)
	}
})()
