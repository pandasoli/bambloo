import { writable } from 'svelte/store'
import { updateGlobal } from '@/utils/update_global.ts'


const state = writable<string[]>([])

const change = (msgs: string[]) => {
	state.set(msgs)
	updateGlobal(msgs, 'popup')
}

const append = (msg: string) =>
	state.update(msgs => {
		msgs.push(msg)

		updateGlobal(msgs, 'popup')
		return msgs
	})

chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'popup update')
		state.set(msg.data)
})

export const popup = {
	...state,
	change,
	append
}
