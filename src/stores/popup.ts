import { writable } from 'svelte/store'

import { set_updatters } from '@/utils/storeUpdaters.ts'


const state = writable<string[]>([])
set_updatters(state, 'popup')

const append = (msg: string) =>
	state.update(msgs => {
		msgs.push(msg)
		console.warn(msg)

		return msgs
	})


export const popup = {
	...state,
	append
}
