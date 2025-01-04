import { get } from 'svelte/store'

import { tabs } from '@/stores/tabs.ts'
import { popup } from '@/stores/popup.ts'
import { conn } from '@/stores/conn.ts'
import { presence_api } from '@/stores/presence_api'

import type { Presence } from '@/models/Presence.ts'


if (import.meta.env.FIREFOX)
	var scripts: {presence_id: number, fn: () => void}[] = []


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

	if (import.meta.env.CHROME)
		return browser.userScripts.register([{
			id: presence.id.toString(),
			world: 'USER_SCRIPT',
			matches: presence.urls,
			runAt: 'document_start',
			js: [{ code }]
		}])
	else if (import.meta.env.FIREFOX) {
		const onUpdate = (tabId: number, info: chrome.tabs.TabChangeInfo) => {
			if (info.status !== 'complete') return

			const tab = get(tabs).find(e => e.id === tabId)!
			if (tab.presence_id !== presence.id) return

			browser.scripting.executeScript({
				target: { tabId },
				args: [code],
				func: code => eval(code)
			})
			sendMessage(tabId, { type: 'start' })
		}

		browser.tabs.onUpdated.addListener(onUpdate)

		scripts.push({
			presence_id: presence.id,
			fn: () => browser.tabs.onUpdated.removeListener(onUpdate)
		})
	}
}

export const unregister = (presence: Presence) => {
	get(tabs).forEach(tab => {
		if (tab.presence_id === presence.id) {
			conn.message({ event: 'remove', tabId: tab.id })
			sendMessage(tab.id!, { type: 'stop' })
		}
	})

	if (import.meta.env.CHROME)
		return browser.userScripts.unregister({
			ids: [ presence.id.toString() ]
		})
	else if (import.meta.env.FIREFOX) {
		const script = scripts.find(e => e.presence_id === presence.id)!

		script.fn()
		scripts = scripts.filter(e => e.presence_id !== presence.id)
	}
}

export const sendMessage = (tabId: number, data: unknown) =>
	browser.scripting.executeScript({
		target: { tabId },
		args: [data],
		func: detail =>
			dispatchEvent(new CustomEvent('message', { detail }))
	})
