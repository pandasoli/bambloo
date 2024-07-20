import { writable } from 'svelte/store'
import { updateGlobal } from '@/utils/update_global.ts'
import type { Tab } from '@/models/tab.ts'


export type UIData = { tab: Tab }

const initial: UIData = {
	tab: 'presences'
}


const state = writable<UIData>(initial)

const change = (new_ui: UIData) => {
	state.set(new_ui)
	updateGlobal(new_ui, 'ui')
}

const setTab = (tab: Tab) =>
	state.update(ui => {
		ui.tab = tab

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
	setTab
}
