import { get, writable } from 'svelte/store'

import { presences } from '@/stores/presences.ts'

import type { Tab } from '@/models/Tab.ts'
import type { Presence } from '@/models/Presence.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'
import * as userScript from '@/utils/userScript.ts'


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
				return regex.test(raw_tab.url as string)
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
	chrome.tabs.query({}, tabs => state.set(tabs.map(fill_tab)))

	chrome.tabs.onCreated.addListener(tab => append(tab))
	chrome.tabs.onRemoved.addListener(id => remove(id))

	chrome.tabs.onUpdated.addListener((id, info, raw_tab) => {
		if (info.status !== 'complete') return

		state.update(tabs => {
			/* There must be a tab in the list
			 * because when a tab closes it is
			 * removed from the list
			 */
			const old = tabs.find(e => e.id === id) as Tab
			const tab = fill_tab(raw_tab)
			const presence = get(presences)?.find(e => e.id === tab.presence_id)
			const input = presence?.input

			tab.enabled = old.enabled

			if (tab.enabled && presence?.enabled)
				userScript.sendMessage(id, { type: 'start', input })

			return tabs
				.map(e => e.id === id ? tab : e)
		})
	})
}

const append = (raw_tab: chrome.tabs.Tab) =>
	state.update(tabs => {
		const tab = fill_tab(raw_tab)

		if (tab.id && tab.presence_id) {
			/* There must be a presence with this id
			 * because when a presence is uninstalled
			 * its id is removed from all tabs
			 */
			const presence = get(presences)?.find(e => e.id === tab.presence_id) as Presence
			const input = presence.input

			if (presence.enabled)
				userScript.sendMessage(tab.id, tab.enabled ? { type: 'start', input } : { type: 'stop' })
		}

		tabs.push(tab)
		return tabs
	})

const remove = (id: number) =>
	state.update(tabs =>
		tabs.filter(e => e.id !== id)
	)

const toggle_enabled = (id: number) =>
	state.update(tabs => {
		/* There must be a tab in the list
		 * because when a tab closes it is
		 * removed from the list
		 */
		const tab = tabs.find(e => e.id === id) as Tab

		tab.enabled = !tab.enabled

		if (tab.id && tab.presence_id) {
			const presence = get(presences)?.find(e => e.id === tab.presence_id)
			const input = presence?.input

			if (presence?.enabled)
				userScript.sendMessage(tab.id, tab.enabled ? { type: 'start', input } : { type: 'stop' })
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
