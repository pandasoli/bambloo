import { writable } from 'svelte/store'
import { updateGlobal } from '@/utils/update_global.ts'
import type { Presence } from '@/models/Presence.ts'
import type { Manifest } from '@/models/Manifest.ts'


/*
	It's needed to be nullable for the effect of
	not overwriting invalid data in the storage.
	It's only overwritten when the user does so.
*/
const state = writable<Presence[]|null>(null)
const problematic_data = writable<any>()
const default_enabled = true

const append = (manifest: Manifest) =>
	state.update(presences => {
		presences = presences ?? []
		presences.push({ ...manifest, enabled: default_enabled })

		updateGlobal(presences, 'presences')
		return presences
	})

const remove = (presence: Manifest) =>
	state.update(presences => {
		if (!presences) return presences

		presences = presences.filter(e => e.title !== presence.title)

		updateGlobal(presences, 'presences')
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

		updateGlobal(presences, 'presences')
		return presences
	})

const panic = (data: any) => problematic_data.set(data)

chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'presences update')
		state.set(msg.data)
})

export const problem = { ...problematic_data }

export const presences = {
	...state,
	append,
	remove,
	toggle_enabled,
	panic
}
