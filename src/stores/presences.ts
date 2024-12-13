import { writable } from 'svelte/store'
import { updateGlobal } from '@/utils/update_global.ts'
import type { PresenceScript } from '@/models/PresenceScript.ts'
import type { Manifest } from '@/models/Manifest.ts'


/*
	It's needed to be nullable for the effect of
	not overwriting invalid data in the storage.
	It's only overwritten when the user does so.
*/
const state = writable<PresenceScript[]|null>(null)
const problematic_data = writable<any>()

const append = (manifest: Manifest) =>
	state.update(presences => {
		presences = presences ?? []
		presences.push({ ...manifest, active: true })

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
	panic
}
