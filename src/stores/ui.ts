import { writable } from 'svelte/store'
import { updateGlobal } from '@/utils/update_global.ts'
import type { AppTab } from '@/models/AppTab.ts'


export type UIData = {
	tab: AppTab
	config_open: boolean
}

const initial: UIData = {
	tab: 'presences',
	config_open: false
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

chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'ui update')
		state.set(msg.data)
})

export const ui = {
	...state,
	change,
	setTab,
	toggleConfigOpen
}
