import { writable } from 'svelte/store'

import { set_updatters } from '@/utils/storeUpdaters.ts'


const state = writable<string[]>([
	'pandasoli/bambloo-repo'
])
set_updatters(state, 'repos')


export const repos = { ...state }
