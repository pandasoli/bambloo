import { get } from 'svelte/store'

import { ConnMethod } from '@/models/Conn.ts'
import type { Activity } from '@/models/Activity.ts'

import { saveDataLocally } from '@/utils/saveData.ts'
import { tryset_conn } from '@/utils/tryset_conn.ts'
import * as presenceScripts from '@/utils/presence_scripts.ts'

import { conn } from '@/stores/conn.ts'
import { presences } from '@/stores/presences.ts'
import { tabs } from '@/stores/tabs.ts'
import { alltabs } from '@/stores/alltabs.ts'
import { repos } from '@/stores/repos.ts'
import { presence_api } from '@/stores/presence_api.ts'


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

const onPresenseMessage = async (msg: any, tabId: number) => {
	const tab = get(tabs).find(e => e.id === tabId)!

	// Prevent generic presences to set activity for any tab
	if (msg.id !== tab.presence_id)
		return

	switch (msg.type) {
		case 'log':
			console.log(`[presence:${tab.title}]`, msg.data)
			break
	
		case 'activity':
			const activity = msg.activity as Activity

			if (activity.state && activity.state?.length > 128)
				activity.state = activity.state.substring(0, 125) + '…'

			console.log(activity)
			conn.message({ event: 'update', tabId, activity })
	}
}


export default defineBackground(() => {
	browser.runtime.onMessage.addListener((msg, _, send) => {
		switch (msg.type) {
			case 'connect': {
				const method: ConnMethod = msg.method
				tryset_conn(method, msg.args, send)
				return true
			}

			case 'reconnect discord': conn.reconnect(); break
			case 'tab toggle': tabs.toggle_enabled(msg.id); break
			case 'presence toggle': presences.toggle_enabled(msg.id); break
			case 'presence remove': presences.remove(msg.manifest)
		}
	})

	browser.tabs.onRemoved.addListener(tabId =>
		tabHostUpdate(tabId, () =>
			conn.message({ event: 'remove', tabId })))

	browser.tabs.onActivated.addListener(({ tabId }) =>
		tabHostUpdate(tabId, () =>
			conn.message({ event: 'focus', tabId: tabId })))

	if (import.meta.env.CHROME)
		chrome.userScripts.configureWorld({
			csp: "script-src 'self' 'unsafe-eval'",
			messaging: true
		})

	{
		const onMessage = (msg: any, sender: chrome.runtime.MessageSender) => {
			if (!sender.tab || !sender.tab.id) return
			onPresenseMessage(msg, Number(sender.tab?.id))
		}

		if (import.meta.env.CHROME) browser.runtime.onUserScriptMessage.addListener(onMessage)
		else if (import.meta.env.FIREFOX) browser.runtime.onMessage.addListener(onMessage)
	}

	browser.runtime.onConnect.addListener(port =>
		port.onDisconnect.addListener(saveDataLocally))

	// Run on background start
	;(async () => {
		await presence_api.load()

		const { fill, start } = tabs.load()
		conn.load()
		presences.load()
		repos.load()
		alltabs.load()

		fill()
		presenceScripts.load()
		start()
	})()
})
