import { writable } from 'svelte/store'

import { updateGlobal } from '@/utils/update_global.ts'

import type { Manifest } from '@/models/Manifest.ts'
import { AppTab } from '@/models/AppTab.ts'


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

const change = (new_ui: UIData) => {
	state.set(new_ui)
	updateGlobal(new_ui, 'ui')
}

const setTab = (tab: AppTab) =>
	state.update(ui => {
		ui.tab = tab

		updateGlobal(ui, 'ui')
		return ui
	})

const toggleConfigOpen = () =>
	state.update(ui => {
		ui.config_open = !ui.config_open

		updateGlobal(ui, 'ui')
		return ui
	})

const setOpenedPresence = (presence: Manifest) =>
	state.update(ui => {
		ui.opened_presence = presence

		updateGlobal(ui, 'ui')
		return ui
	})

chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'ui update')
		state.set(msg.data)
})

export const ui = {
	...state,
	change,
	setTab,
	toggleConfigOpen,
	setOpenedPresence
}
