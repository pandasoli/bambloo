import { writable } from 'svelte/store'
import { updateGlobal } from '@/utils/update_global.ts'


const state = writable<string|null>(null)

const change = (new_conn: string|null) => {
	state.set(new_conn)
	updateGlobal(new_conn, 'popup')
}

chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'popup update')
		state.set(msg.data)
})

export const popup = {
	...state,
	change
}
