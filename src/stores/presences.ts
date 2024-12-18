import { writable } from 'svelte/store'

import type { Presence } from '@/models/Presence.ts'
import type { Manifest } from '@/models/Manifest.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'


/*
	It's needed to be nullable for the effect of
	not overwriting invalid data in the storage.
	It's only overwritten when the user does so.
*/
const state = writable<Presence[]|null>([])
const problematic_data = writable<any>()
const default_enabled = true
set_updatters(state, 'presences')

const append = (manifest: Manifest) =>
	state.update(presences => {
		presences = presences ?? []
		presences.push({ ...manifest, enabled: default_enabled })

		return presences
	})

const remove = (presence: Manifest) =>
	state.update(presences => {
		if (!presences) return presences

		presences = presences.filter(e => e.title !== presence.title)

		return presences
	})

const toggle_enabled = (presence: Presence) =>
	state.update(presences => {
		if (!presences) return presences

		for (const presence_ of presences)
			if (presence_.title === presence.title) {
				presence_.enabled = !presence_.enabled
				break
			}

		return presences
	})

const change_input = (title: string, input: string) =>
	state.update(presences => {
		if (!presences) return presences

		for (const presence of presences)
			if (presence.title === title) {
				presence.input = input
				break
			}

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
