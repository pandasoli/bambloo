import { writable } from 'svelte/store'
import { updateGlobal } from '@/utils/update_global.ts'


const state = writable<string[]>([
	'pandasoli/bambloo-repo'
])

const change = (msgs: string[]) => {
	state.set(msgs)
	updateGlobal(msgs, 'repos')
}

chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'repos update')
		state.set(msg.data)
})

export const repos = {
	...state,
	change
}
