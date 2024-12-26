import { get } from 'svelte/store'

import { tabs } from '@/stores/tabs.ts'
import { popup } from '@/stores/popup.ts'

import type { Presence } from '@/models/Presence.ts'


export const register = async (presence: Presence) => {
	const res = await fetch(presence.script)

	if (res.status !== 200) {
		popup.append(`Couldn't fetch script of <span class='error code'>${presence.title}</span>`)
		return
	}

	const text = await res.text()

	const api = `
		const bambloo = {
			update: presence => chrome.runtime.sendMessage({ type: 'presence', presence }),
			log: data => chrome.runtime.sendMessage({ type: 'log', data }),
			onMessage: callback => addEventListener('message', e => callback(e.detail)),

			repo: '${presence.repo}',
			path: '${presence.path}'
		}
	`

	const code = api + text

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
