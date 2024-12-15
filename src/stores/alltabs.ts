import { writable } from 'svelte/store'
import { updateGlobal } from '@/utils/update_global.ts'


const state = writable<boolean>(true)

const toggle = () =>
	state.update(alltabs => {
		alltabs = !alltabs

		updateGlobal(alltabs, 'alltabs')
		return alltabs
	})

chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'alltabs update')
		state.set(msg.data)
})

export const alltabs = {
	...state,
	toggle
}
