import { writable } from 'svelte/store'

import { popup } from '@/stores/popup.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'


const defaults = [ 'pandasoli/bambloo-repo' ]


/*
	It's needed to be nullable for the effect of
	not overwriting invalid data in the storage.
	It's only overwritten when the user does so.
*/
const state = writable<string[]|null>(defaults)
const bad_data = writable<any>(null)
set_updatters(state, 'repos')
set_updatters(bad_data, 'repos bad data')

const load = async () => {
	const { repos: data } = await browser.storage.local.get('repos')
	if (data === undefined) {
		state.set(defaults)
		return true
	}

	if (!Array.isArray(data)) {
		panic(data)
		popup.append('Repos list stored is not valid')
		return false
	}

	state.set(data)
	return true
}

const panic = (data: any) => {
	state.set(null)
	bad_data.set(data)
}


export const repos_bad_data = bad_data
export const repos = { ...state, defaults, load, panic }
