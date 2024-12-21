import { writable } from 'svelte/store'

import type { Manifest } from '@/models/Manifest.ts'
import { AppTab } from '@/models/AppTab.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'


export type UIData = {
	tab: AppTab
	config_open: boolean
	opened_presence: Manifest|null // for Store
}

const initial: UIData = {
	tab: AppTab.Presences,
	config_open: false,
	opened_presence: null
}


const state = writable<UIData>(initial)
set_updatters(state, 'ui')

const setTab = (tab: AppTab) =>
	state.update(ui => {
		ui.tab = tab
		return ui
	})

const toggleConfigOpen = () =>
	state.update(ui => {
		ui.config_open = !ui.config_open
		return ui
	})

const setOpenedPresence = (presence: Manifest | null) =>
	state.update(ui => {
		ui.opened_presence = presence
		return ui
	})


export const ui = {
	...state,
	setTab,
	toggleConfigOpen,
	setOpenedPresence
}
