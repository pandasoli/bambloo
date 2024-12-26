import { writable } from 'svelte/store'

import type { Presence } from '@/models/Presence.ts'
import type { Manifest } from '@/models/Manifest.ts'

import { tabs } from '@/stores/tabs.ts'
import { popup } from '@/stores/popup.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'
import * as userScript from '@/utils/userScript'


/*
	It's needed to be nullable for the effect of
	not overwriting invalid data in the storage.
	It's only overwritten when the user does so.
*/
const state = writable<Presence[]|null>([])
const problematic_data = writable<any>()
set_updatters(state, 'presences')

const append = (manifest: Manifest, repo: string, path: string) =>
	state.update(presences => {
		if (!presences) return presences

		let id = 0
		while (presences.some(e => e.id === id)) id++

		const presence: Presence = { ...manifest, id, repo, path, enabled: true }

		presences.push(presence)
		userScript.register(presence)
			.catch(popup.append)

		return presences
	})

const remove = (manifest: Manifest) =>
	state.update(presences => {
		if (!presences) return presences

		const presence = presences.find(e => e.title === manifest.title)
		presences = presences.filter(e => e.title !== manifest.title)

		if (presence) {
			userScript.unregister(presence)

			tabs.update(tabs =>
				tabs.map(tab => {
					if (tab.presence_id === presence.id) delete tab.presence_id
					return tab
				})
			)
		}

		return presences
	})

const toggle_enabled = (presence: Presence) =>
	state.update(presences => {
		if (!presences) return presences

		presence.enabled = !presence.enabled

		if (presence.enabled) userScript.register(presence).catch(popup.append)
		else userScript.unregister(presence)

		return presences
	})

const change_input = (presence: Presence, input: string) =>
	state.update(presences => {
		if (!presences) return presences

		presence.input = input

		return presences
	})

const panic = (data: any) => {
	state.set(null)
	problematic_data.set(data)
}


export const problem = { ...problematic_data }

export const presences = {
	...state,
	append,
	remove,
	toggle_enabled,
	change_input,
	panic
}
