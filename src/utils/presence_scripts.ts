import { get, writable } from 'svelte/store'

import { tabs } from '@/stores/tabs.ts'
import { popup } from '@/stores/popup.ts'
import { conn } from '@/stores/conn.ts'
import { presence_api } from '@/stores/presence_api'
import { presences } from '@/stores/presences.ts'

import type { Presence } from '@/models/Presence.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'


const details = writable<{presence_id: number, code: string}[]>([])
set_updatters(details, 'presence_scripts details')


export const load = () => {
	if (import.meta.env.FIREFOX)
		browser.tabs.onUpdated.addListener((tabId, info) => {
			if (info.status !== 'complete') return

			const tab = get(tabs).find(e => e.id === tabId)!
			if (!tab.enabled) return
			if (tab.presence_id === undefined) return

			const presence = get(presences)?.find(e => e.id === tab.presence_id)!
			if (!presence.enabled) return

			const detail = get(details).find(e => e.presence_id === presence.id)!

			browser.scripting.executeScript({
				target: { tabId },
				args: [detail.code],
				func: code => eval(code)
			})
		})
}

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
	else if (import.meta.env.FIREFOX)
		details.update(details => [
			...details,
			{ presence_id: presence.id, code }
		])
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
	else if (import.meta.env.FIREFOX)
		details.update(details => details.filter(e => e.presence_id !== presence.id))
}

export const sendMessage = (tabId: number, data: unknown) =>
	browser.scripting.executeScript({
		target: { tabId },
		args: [data],
		func: detail =>
			dispatchEvent(new CustomEvent('message', { detail }))
	})
