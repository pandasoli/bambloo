import { get, writable } from 'svelte/store'

import { presences } from '@/stores/presences.ts'
import { conn } from '@/stores/conn.ts'

import type { Tab } from '@/models/Tab.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'
import * as presenceScript from '@/utils/presence_scripts.ts'


const state = writable<Tab[]>([])
set_updatters(state, 'tabs')

const fill_tab = (raw_tab: chrome.tabs.Tab): Tab => {
	let presence_id: number|undefined = undefined

	if (raw_tab.id && raw_tab.url) {
		const presence = get(presences)?.find(presence =>
			presence.urls.some(url => {
				const str = url
					.replace(/\./g, '\\.')
					.replace(/\*/g, '.*')

				const regex = new RegExp(str)
				/* url cannot be null as checked above */
				return regex.test(raw_tab.url!)
			})
		)

		presence_id = presence?.id
	}

	return {
		...raw_tab,
		enabled: true,
		presence_id
	}
}

const load = () => {
	browser.tabs.query({}, tabs => state.set(tabs.map(fill_tab)))

	browser.tabs.onCreated.addListener(tab => append(tab))
	browser.tabs.onRemoved.addListener(id => remove(id))

	return {
		fill: () => browser.tabs.onUpdated.addListener((id, info, raw_tab) => {
			if (info.status !== 'complete') return

			state.update(tabs => {
				const old = tabs.find(e => e.id === id)!
				const tab = fill_tab(raw_tab)

				tab.enabled = old.enabled

				return tabs.map(e => e.id === id ? tab : e)
			})
		}),

		start: () => browser.tabs.onUpdated.addListener((id, info) => {
			if (info.status !== 'complete') return

			const tab = get(tabs).find(e => e.id === id)!
			const presence = get(presences)?.find(e => e.id === tab.presence_id)
			const input = presence?.input

			if (tab.enabled && presence?.enabled)
				presenceScript.sendMessage(id, { type: 'start', input })
		})
	}
}

const append = (raw_tab: chrome.tabs.Tab) =>
	state.update(tabs => {
		const tab = fill_tab(raw_tab)

		if (!tab.id) {
			console.warn('[tabsStore>append]', `Tab "${raw_tab.title}" has no id`)
			return tabs
		}

		if (tab.presence_id !== undefined) {
			const presence = get(presences)?.find(e => e.id === tab.presence_id)!
			const input = presence.input

			if (presence.enabled && tab.enabled)
				presenceScript.sendMessage(tab.id, { type: 'start', input })
		}

		return [ ...tabs, tab ]
	})

const remove = (id: number) =>
	state.update(tabs =>
		tabs.filter(e => e.id !== id))

const toggle_enabled = (id: number) =>
	state.update(tabs => {
		const tab = tabs.find(e => e.id === id)!
		tab.enabled = !tab.enabled

		if (tab.presence_id !== undefined) {
			const presence = get(presences)?.find(e => e.id === tab.presence_id)!
			const input = presence.input
			const enabled = presence.enabled && tab.enabled

			conn.message({
				event: enabled ? 'update' : 'remove',
				tabId: tab.id
			})
			presenceScript.sendMessage(tab.id!,
				enabled ? { type: 'start', input } : { type: 'stop' })
		}

		return tabs
	})


export const tabs = {
	...state,
	load,
	append,
	remove,
	toggle_enabled
}
