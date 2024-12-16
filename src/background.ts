import { get } from 'svelte/store'

import { isConnMethod } from '@/models/conn.ts'
import type { ConnMethod } from '@/models/conn.ts'
import type { Presence } from '@/models/Presence.ts'

import { try_conn } from '@/services/connect.ts'

import { conn } from '@/stores/conn.ts'
import { popup } from '@/stores/popup.ts'
import { ui } from '@/stores/ui.ts'
import { presences } from '@/stores/presences.ts'
import { tabs } from '@/stores/tabs.ts'
import { alltabs } from '@/stores/alltabs.ts'
import { repos } from '@/stores/repos.ts'

import { updateGlobal } from '@/utils/update_global.ts'


chrome.runtime.onMessage.addListener((msg, _, send) => {
	if (msg?.type.startsWith('try')) {
		const method = msg.type.substring('try '.length) as ConnMethod

		try_conn(method, msg.args)
			.then(({ promise, err }) => {
				if (err) return send(err)
				if (!promise) return // just to make it not |undefined

				chrome.runtime.sendMessage({
					to: 'connectionchooser',
					state: 'waiting for details'
				})

				promise.then(({ conn: conn_ }) => {
					if (conn_) conn.change(conn_)
					send(err)
				})
			})

		return true
	}
})

chrome.runtime.onConnect.addListener(async port => {
	updateGlobal(get(conn), 'conn')
	updateGlobal(get(popup), 'popup')
	updateGlobal(get(ui), 'ui')
	updateGlobal(get(presences), 'presences')
	updateGlobal(get(tabs), 'tabs')
	updateGlobal(get(repos), 'repos')
	updateGlobal(get(alltabs), 'alltabs')

	port.onDisconnect.addListener(() => {
		// Store data that is required between connections
		const presences_ = get(presences)
		const conn_ = get(conn)
		const repos_ = get(repos)
		const alltabs_ = get(alltabs)

		const method = conn_?.connected ? conn_.method : null
		const args = conn_?.connected ? conn_.args : null

		// Store data
		const data = {
			conn: { method, args },
			repos: repos_,
			alltabs: alltabs_,
			presences: presences_ as Presence[]|undefined
		}

		// Needed to not overwrite invalid data in storage
		if (!data.presences) delete data.presences

		chrome.storage.local.set(data)
	})
})

// Run on background start
;(async () => {
	const { conn: conn_data } = await chrome.storage.local.get('conn')
	const { presences: presences_data } = await chrome.storage.local.get('presences')
	const { repos: repos_data } = await chrome.storage.local.get('repos')
	const { alltabs: alltabs_data } = await chrome.storage.local.get('alltabs')

	if (conn_data !== undefined && conn_data?.method !== null) {
		if (!isConnMethod(conn_data?.method))
			popup.append('Connection method stored is not valid')
		else {
			const { promise, err } = await try_conn(conn_data.method, conn_data.args)

			if (promise) {
				const { conn: nconn } = await promise

				if (nconn) conn.set(nconn)
			}
			else if (err) popup.append(err)
		}
	}

	if (presences_data !== undefined) {
		if (!Array.isArray(presences_data))
			presences.panic(presences_data)
		else
			presences.set(presences_data)
	}

	if (repos_data !== undefined) {
		if (!Array.isArray(repos_data))
			popup.append('Repos list stored is not valid')
		else
			repos.set(repos_data)
	}

	if (alltabs_data !== undefined) {
		if (typeof alltabs_data !== 'boolean')
			popup.append('AllTabs option stored is not valid')
		else
			alltabs.set(alltabs_data)
	}

	tabs.load()
})()
