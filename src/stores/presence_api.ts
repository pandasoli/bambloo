import { writable } from 'svelte/store'

import { set_updatters } from '@/utils/storeUpdaters.ts'
import { popup } from '@/stores/popup.ts'


const state = writable<string|null>(null)
set_updatters(state, 'presence_api')

const load = async () => {
	let res = await fetch('https://raw.githubusercontent.com/pandasoli/bambloo-repo/refs/heads/master/bambloo.js')

	if (res.status !== 200) {
		popup.append(`Couldn't fetch Bambloo userScript API`)
		return
	}

	const code = await res.text()
	state.set(code)
}


export const presence_api = {
	...state,
	load
}
