import { writable } from 'svelte/store'

import { set_updatters } from '@/utils/storeUpdaters.ts'


const state = writable<boolean>(true)
set_updatters(state, 'alltabs')

const toggle = () =>
	state.update(alltabs => !alltabs)


export const alltabs = {
	...state,
	toggle
}
