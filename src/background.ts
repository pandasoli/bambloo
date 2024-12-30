import { get } from 'svelte/store'

import { ConnMethod } from '@/models/Conn.ts'
import { AppTab } from '@/models/AppTab.ts'
import type { Presence } from '@/models/Presence.ts'
import type { Activity } from '@/models/Activity.ts'
import type { Tab } from '@/models/Tab.ts'

import { saveDataLocally } from '@/utils/saveData.ts'
import { tryset_conn } from '@/utils/tryset_conn.ts'

import { conn } from '@/stores/conn.ts'
import { popup } from '@/stores/popup.ts'
import { ui } from '@/stores/ui.ts'
import { presences } from '@/stores/presences.ts'
import { tabs } from '@/stores/tabs.ts'
import { alltabs } from '@/stores/alltabs.ts'
import { repos } from '@/stores/repos.ts'
import { presence_api } from '@/stores/presence_api.ts'


chrome.runtime.onMessage.addListener((msg, _, send) => {
	switch (msg.type) {
		case 'connect':
			const method: ConnMethod = msg.method
			const set_first: boolean = msg.set_first

			tryset_conn(method, msg.args, set_first, send)
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

chrome.tabs.onActivated.addListener(({ tabId }) =>
	tabHostUpdate(tabId, () =>
		conn.message({ event: 'focus', tabId: tabId })))

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

	port.onDisconnect.addListener(saveDataLocally)
})

// Run on background start
;(async () => {
	tabs.load()
	await presence_api.load()

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
			tryset_conn(conn_data.method, conn_data.args, true)
	}

	if (presences_data !== undefined) {
		if (!Array.isArray(presences_data))
			presences.panic(presences_data)
		else
			presences_data.forEach(presences.append)
	}
	else
		ui.setTab(AppTab.Store)

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
})()
