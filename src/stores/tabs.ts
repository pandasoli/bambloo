import { writable } from 'svelte/store'

import type { Tab } from '@/models/Tab.ts'

import { updateGlobal } from '@/utils/update_global.ts'


const state = writable<Tab[]>([])
const default_enabled = true

const load = () => {
	chrome.tabs.query({}, tabs => state.set(tabs.map(e => ({ ...e, enabled: default_enabled }))))
	chrome.tabs.onCreated.addListener(tab => append(tab))
	chrome.tabs.onRemoved.addListener(id => remove(id))
}

const append = (tab: chrome.tabs.Tab) =>
	state.update(tabs => {
		tabs = tabs ?? []
		tabs.push({ ...tab, enabled: default_enabled })

		updateGlobal(tabs, 'tabs')
		return tabs
	})

const remove = (id: number) =>
	state.update(tabs => {
		tabs = tabs.filter(e => e.id !== id)

		updateGlobal(tabs, 'tabs')
		return tabs
	})

const toggle_enabled = (id: number) =>
	state.update(tabs => {
		for (const tab of tabs)
			if (tab.id === id) {
				tab.enabled = !tab.enabled
				break
			}

		updateGlobal(tabs, 'tabs')
		return tabs
	})

chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'tabs update')
		state.set(msg.data)
})

export const tabs = {
	...state,
	load,
	append,
	remove,
	toggle_enabled
}
