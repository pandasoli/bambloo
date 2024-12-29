import { get, writable } from 'svelte/store'

import type { Manifest } from '@/models/Manifest.ts'
import { AppTab } from '@/models/AppTab.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'


export type ErrButton = {
	text: string
	outline?: boolean
	fn: () => void
}

type UIData = {
	tab: AppTab
	config_open: boolean
	presence_open?: ({ repo: string, path: string } & Manifest) // for Store
	error?: {
		msg: string
		buttons: ErrButton[]
	}
}

const initial: UIData = {
	tab: AppTab.Presences,
	config_open: false
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

const setOpenedPresence = (presence?: ({ repo: string, path: string } & Manifest)) =>
	state.update(ui => {
		ui.presence_open = presence
		return ui
	})

const setError = (msg: string, buttons: ErrButton[]) =>
	state.update(ui => {
		ui.error = { msg, buttons }
		return ui
	})


chrome.runtime.onMessage.addListener(msg => {
	switch (msg.type) {
		case 'error':
			const i = msg.index
			get(state).error?.buttons[i].fn()
	}
})


export const ui = {
	...state,
	setTab,
	toggleConfigOpen,
	setOpenedPresence,
	setError
}
