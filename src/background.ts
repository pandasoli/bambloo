import { get } from 'svelte/store'

import { ConnMethod } from '@/models/Conn.ts'
import type { Activity } from '@/models/Activity.ts'

import { saveDataLocally } from '@/utils/saveData.ts'
import { tryset_conn } from '@/utils/tryset_conn.ts'

import { conn } from '@/stores/conn.ts'
import { presences } from '@/stores/presences.ts'
import { tabs } from '@/stores/tabs.ts'
import { alltabs } from '@/stores/alltabs.ts'
import { repos } from '@/stores/repos.ts'
import { presence_api } from '@/stores/presence_api.ts'


chrome.runtime.onMessage.addListener((msg, _, send) => {
	switch (msg.type) {
		case 'connect': {
			const method: ConnMethod = msg.method
			const set_first: boolean = msg.set_first

			tryset_conn(method, msg.args, set_first, send)
			return true
		}

		case 'presence toggle':
			presences.toggle_enabled(msg.id)
			break

		case 'tab toggle':
			tabs.toggle_enabled(msg.id)
	}
})

const tabHostUpdate = (tabId: number, callback: () => void) => {
	const tab = get(tabs).find(e => e.id === tabId)!

	if (tab.presence_id === undefined) return
	if (!tab.enabled) return

	const presences_ = get(presences)
	if (!presences_) return

	const presence = presences_.find(e => e.id === tab.presence_id)!
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
	const tab = get(tabs).find(e => e.id === tabId)!

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

chrome.runtime.onConnect.addListener(async port =>
	port.onDisconnect.addListener(saveDataLocally))

// Run on background start
;(async () => {
	await presence_api.load()

	tabs.load()
	conn.load()
	presences.load()
	repos.load()
	alltabs.load()
})()
