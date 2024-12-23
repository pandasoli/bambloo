import { get } from 'svelte/store'

import { tabs } from '@/stores/tabs'

import type { Presence } from '@/models/Presence.ts'


export const register = async (presence: Presence) => {
	const res = await fetch(presence.script)
	const text = await res.text()

	const messaging = `
		const update = presence => chrome.runtime.sendMessage({ type: 'presence', presence })
		const log = data => chrome.runtime.sendMessage({ type: 'log', data })
	`

	const code = messaging + text
		.split('\n')
		.slice(0, -2)
		.join('\n')

	return chrome.userScripts.register([{
		id: presence.id.toString(),
		world: 'USER_SCRIPT',
		matches: presence.urls,
		runAt: 'document_start',
		js: [{ code }]
	}])
}

export const unregister = (presence: Presence) => {
	get(tabs).forEach(tab => {
		if (tab.id && tab.presence_id === presence.id)
			sendMessage(tab.id, { type: 'stop' })
	})

	return chrome.userScripts.unregister({
		ids: [ presence.id.toString() ]
	})
}

export const sendMessage = (tabId: number, data: any) =>
	chrome.scripting.executeScript({
		target: { tabId },
		args: [data],
		func: (detail: unknown) =>
			dispatchEvent(new CustomEvent('message', { detail }))
	})
