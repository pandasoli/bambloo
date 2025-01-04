import { get } from 'svelte/store'

import { tabs } from '@/stores/tabs.ts'
import { popup } from '@/stores/popup.ts'
import { conn } from '@/stores/conn.ts'
import { presence_api } from '@/stores/presence_api'

import type { Presence } from '@/models/Presence.ts'


export const register = async (presence: Presence) => {
	const api_code = get(presence_api)
	if (!api_code) return

	const api = api_code
		.replace(/<!-- repo -->/, presence.repo)
		.replace(/<!-- path -->/, presence.path)

	const res = await fetch(presence.script)

	if (res.status !== 200)
		return popup.append(`Couldn't fetch script of <span class='warn code'>${presence.title}</span>`)

	const text = await res.text()
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
		if (tab.presence_id === presence.id) {
			conn.message({ event: 'remove', tabId: tab.id })
			sendMessage(tab.id!, { type: 'stop' })
		}
	})

	return chrome.userScripts.unregister({
		ids: [ presence.id.toString() ]
	})
}

export const sendMessage = (tabId: number, data: unknown) =>
	chrome.scripting.executeScript({
		target: { tabId },
		args: [data],
		func: detail =>
			dispatchEvent(new CustomEvent('message', { detail }))
	})
