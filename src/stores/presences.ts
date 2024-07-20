import { writable } from 'svelte/store'
import { updateGlobal } from '@/utils/update_global.ts'


/*
	It's needed to be nullable for the effect of
	not overwriting invalid data in the storage.
	It's only overwritten when the user does so.
*/
const state = writable<string[]|null>(null)

const append = (presence: string) =>
	state.update(presences => {
		presences = presences ?? []
		presences.push(presence)

		updateGlobal(presences, 'presences')
		return presences
	})

const remove = (presence: string) =>
	state.update(presences => {
		if (!presences) return presences

		presences = presences.filter(e => e !== presence)

		updateGlobal(presences, 'presences')
		return presences
	})

chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'presences update')
		state.set(msg.data)
})

export const presences = {
	...state,
	append,
	remove
}
