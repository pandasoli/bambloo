import { get } from 'svelte/store'

import { ConnMethod, ConnState } from '@/models/Conn.ts'
import type { Presence } from '@/models/Presence.ts'
import type { ConnArgs } from '@/models/Conn.ts'
import type { Activity } from '@/models/Activity.ts'
import type { Tab } from '@/models/Tab.ts'

import { try_conn } from '@/services/connect.ts'

import * as userScript from '@/utils/userScript.ts'

import { conn } from '@/stores/conn.ts'
import { popup } from '@/stores/popup.ts'
import { ui } from '@/stores/ui.ts'
import { presences } from '@/stores/presences.ts'
import { tabs } from '@/stores/tabs.ts'
import { alltabs } from '@/stores/alltabs.ts'
import { repos } from '@/stores/repos.ts'


const connect = (method: ConnMethod, args: ConnArgs, set_first: boolean, onErr?: (err: string) => void) => {
	try_conn(method, args).then(res => {
		const { conn: conn_ } = res

		if (set_first) {
			conn.stop()
			conn.change(conn_)
			conn.setState(ConnState.WaitingDetails)
		}

		if ('err' in res) {
			if (set_first) conn.setErrMsg(res.err)
			return onErr?.(res.err)
		}

		chrome.runtime.sendMessage({type: 'conn state update', state: ConnState.WaitingDetails})

		const { details } = res

		details.then(details => {
			if (!set_first) {
				conn.stop()
				conn.change(conn_)
			}

			conn.setDetails(details)
			conn.setState(ConnState.Connected)

			chrome.runtime.sendMessage({type: 'conn state update', state: ConnState.Connected})
		})
	})
}

chrome.runtime.onMessage.addListener((msg, _, send) => {
	switch (msg.type) {
		case 'connect':
			const method: ConnMethod = msg.method
			const set_first: boolean = msg.set_first

			connect(method, msg.args, set_first, send)
			return true
	}
})

const tabHostUpdate = (tabId: number, callback: () => void) => {
	/*
	 * In theory the tab might not be in the list because
	 * stores/tabs listens to tabs.onRemoved and it could
	 * be executed first and the tab removed from the list
	 * but in my tests this works.
	 */
	const tab = get(tabs).find(e => e.id === tabId) as Tab

	if (tab.presence_id === undefined) return
	if (!tab.enabled) return

	const presences_ = get(presences)
	if (!presences_) return

	const presence = presences_.find(e => e.id === tab.presence_id) as Presence
	if (!presence.enabled) return

	callback()
}

chrome.tabs.onRemoved.addListener(tabId =>
	tabHostUpdate(tabId, () =>
		conn.message({ event: 'remove', tabId })))

chrome.tabs.onActivated.addListener(info =>
	tabHostUpdate(info.tabId, () =>
		conn.message({ event: 'focus', tabId: info.tabId })))

const onPresenseMessage = async (msg: any, tabId: number) => {
	const tab = get(tabs).find(e => e.id === tabId) as Tab

	switch (msg.type) {
		case 'log':
			console.log(`[presence:${tab.title}]`, msg.data)
			break
	
		case 'activity':
			const activity = msg.activity as Activity
			conn.message({ event: 'update', tabId, activity })
	}
}

chrome.userScripts.configureWorld({
	csp: "script-src 'self' 'unsafe-eval'",
	messaging: true
})

chrome.runtime.onUserScriptMessage.addListener((msg, sender) => {
	if (!sender.id)
		return console.warn(`Couldn't get id of tab ${sender.tab?.title}`)
	onPresenseMessage(msg, Number(sender.tab?.id))
})

const storeLocalData = () => {
	// Store data that is required between connections
	const presences_ = get(presences) ?? undefined
	const conn_ = get(conn)
	const repos_ = get(repos)
	const alltabs_ = get(alltabs)

	const method = conn_?.method ?? null
	const args = conn_?.method === ConnMethod.WebSocket ? conn_.args : null

	// Store data
	const data = {
		conn: { method, args },
		repos: repos_,
		alltabs: alltabs_,
		presences: presences_
	}

	// Needed to not overwrite invalid data in storage
	if (!data.presences) delete data.presences

	chrome.storage.local.set(data)
}

chrome.runtime.onConnect.addListener(async port => {
	const update = (data: any, name: string) =>
		chrome.runtime.sendMessage({ type: `${name} update`, data })

	update(get(conn), 'conn')
	update(get(popup), 'popup')
	update(get(ui), 'ui')
	update(get(presences), 'presences')
	update(get(tabs), 'tabs')
	update(get(repos), 'repos')
	update(get(alltabs), 'alltabs')

	port.onDisconnect.addListener(storeLocalData)
})

// Run on background start
;(async () => {
	const { conn: conn_data } = await chrome.storage.local.get('conn')
	const { presences: presences_data } = await chrome.storage.local.get('presences')
	const { repos: repos_data } = await chrome.storage.local.get('repos')
	const { alltabs: alltabs_data } = await chrome.storage.local.get('alltabs')

	// TODO: Check not only if data is undefined
	// but if it fits in the model types

	if (conn_data !== undefined && conn_data?.method !== null) {
		if (typeof conn_data?.method !== 'number')
			popup.append('Connection method stored is not valid')
		else
			connect(conn_data.method, conn_data.args, true)
	}

	if (presences_data !== undefined) {
		if (!Array.isArray(presences_data))
			presences.panic(presences_data)
		else {
			presences.set(presences_data)

			presences_data.forEach((e: Presence) => {
				if (e.enabled) userScript.register(e)
					.catch(e => popup.append(String(e)))
			})
		}
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
