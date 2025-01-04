import { writable, get } from 'svelte/store'

import type { Presence } from '@/models/Presence.ts'
import { AppTab } from '@/models/AppTab'
import type { Manifest } from '@/models/Manifest.ts'

import { ui } from '@/stores/ui.ts'
import { tabs } from '@/stores/tabs.ts'
import { popup } from '@/stores/popup.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'
import * as presenceScript from '@/utils/presence_scripts.ts'


/*
	It's needed to be nullable for the effect of
	not overwriting invalid data in the storage.
	It's only overwritten when the user does so.
*/
const state = writable<Presence[]|null>([])
const bad_data = writable<any>()
set_updatters(state, 'presences')
set_updatters(bad_data, 'presences bad data')

const load = async () => {
	const { presences: data } = await chrome.storage.local.get('presences')
	if (data === undefined) return ui.setTab(AppTab.Store)

	if (!Array.isArray(data)) return panic(data)

	/* TODO: Do not assume they're all valid */
	data.forEach(append)
}

const append = (manifest: Manifest) =>
	state.update(presences => {
		if (!presences) return presences

		let id = 0
		while (presences.some(e => e.id === id)) id++

		const presence: Presence = {
			...manifest,
			id,
			repo: manifest.__meta__.repo,
			path: manifest.__meta__.path,
			enabled: true
		}

		presences.push(presence)
		presenceScript.register(presence)
			.catch(popup.append)

		return presences
	})

const remove = (manifest: Manifest) =>
	state.update(presences => {
		if (!presences) return presences

		const presence = presences.find(e => e.title === manifest.title)!

		presenceScript.unregister(presence)

		tabs.update(tabs =>
			tabs.map(tab =>
				tab.presence_id === presence.id ? {...tab, presence_id: undefined} : tab))

		return presences.filter(e => e.title !== manifest.title)
	})

const toggle_enabled = (presence: Presence) =>
	state.update(presences => {
		if (!presences) return presences

		presence.enabled = !presence.enabled

		get(tabs).forEach(tab => {
			if (tab.presence_id === presence.id)
				presenceScript.sendMessage(tab.id!, presence.enabled && tab.enabled
					? { type: 'start', input: presence.input }
					: { type: 'stop' }
				)
		})

		return presences
	})

const change_input = (presence: Presence, input: string) =>
	state.update(presences => {
		if (!presences) return presences

		presence.input = input

		get(tabs).forEach(tab => {
			if (tab.presence_id === presence.id && tab.enabled)
				presenceScript.sendMessage(tab.id!, { type: 'start', input })
		})

		return presences
	})

const panic = (data: any) => {
	state.set(null)
	bad_data.set(data)
}


export const presences_bad_data = bad_data
export const presences = {
	...state,
	load,
	append,
	remove,
	toggle_enabled,
	change_input,
	panic
}
