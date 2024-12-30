import { writable } from 'svelte/store'

import { set_updatters } from '@/utils/storeUpdaters.ts'
import { popup } from './popup'


const state = writable<boolean>(true)
set_updatters(state, 'alltabs')

const load = async () => {
	const { alltabs: data } = await chrome.storage.local.get('alltabs')
	if (data === undefined) return

	if (typeof data !== 'boolean')
		return popup.append('AllTabs option stored is not valid')

	state.set(data)
}

const toggle = () =>
	state.update(alltabs => !alltabs)


export const alltabs = { ...state, load, toggle }
