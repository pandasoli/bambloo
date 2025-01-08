import { writable, get } from 'svelte/store'

import type { Presence } from '@/models/Presence.ts'
import { AppTab } from '@/models/AppTab'
import type { Manifest } from '@/models/Manifest.ts'

import { ui } from '@/stores/ui.ts'
import { tabs } from '@/stores/tabs.ts'
import { popup } from '@/stores/popup.ts'
import { conn } from '@/stores/conn.ts'

import { set_updatters } from '@/utils/storeUpdaters.ts'
import * as presenceScript from '@/utils/presence_scripts.ts'


/*
	It's needed to be nullable for the effect of
	not overwriting invalid data in the storage.
	It's only overwritten when the user does so.
*/
const state = writable<Presence[]|null>([])
const bad_data = writable<any>(null)
set_updatters(state, 'presences')
set_updatters(bad_data, 'presences bad data')

const load = async () => {
	const { presences: data } = await browser.storage.local.get('presences')
	if (data === undefined) return ui.setTab(AppTab.Store)

	if (!Array.isArray(data)) return panic(data)

	const check_item = (item: any) => {
		if (typeof item !== 'object' || item === null) {panic(data); return false}

		if (typeof item.title !== 'string') {panic(data); return false}
		if (typeof item.description !== 'string') {panic(data); return false}
		if (typeof item.author !== 'string') {panic(data); return false}

		if (typeof item.title_color !== 'string') {panic(data); return false}

		if (typeof item.images !== 'object' || item.images === null) {panic(data); return false}
		if (typeof item.images.background !== 'string') {panic(data); return false}
		if (typeof item.images.icon !== 'string') {panic(data); return false}

		if (!Array.isArray(item.previews)) {panic(data); return false}
		if (!item.previews.every((e: any) => typeof e === 'string')) {panic(data); return false}

		if (!Array.isArray(item.urls)) {panic(data); return false}
		if (!item.urls.preview.every((e: any) => typeof e === 'string')) {panic(data); return false}

		if (typeof item.script !== 'string') {panic(data); return false}

		return true
	}

	const success = data.every(check_item)
	if (!success) return

	data.forEach(append)
}

const append = (manifest: Manifest) =>
	state.update(presences => {
		if (!presences) presences = []

		let id = 0
		while (presences.some(e => e.id === id)) id++

		const presence: Presence = {
			...manifest,
			id,
			repo: manifest.__meta__.repo,
			path: manifest.__meta__.path,
			enabled: true
		}

		presenceScript.register(presence)
			.catch(popup.append)

		return [ ...presences, presence ]
	})

const remove = (manifest: Manifest) =>
	state.update(presences => {
		if (!presences) return presences

		const presence = presences.find(e => e.title === manifest.title)!

		presenceScript.unregister(presence)

		get(tabs).forEach(tab => {
			if (tab.presence_id === presence.id) {
				conn.message({ event: 'remove', tabId: tab.id })
				sendMessage(tab.id!, { type: 'stop' })
			}
		})

		tabs.update(tabs =>
			tabs.map(tab =>
				tab.presence_id === presence.id
				? {...tab, presence_id: undefined} : tab
			))

		return presences.filter(e => e.title !== manifest.title)
	})

const toggle_enabled = (id: number) =>
	state.update(presences => {
		if (!presences) return presences

		const presence = presences.find(e => e.id === id)!
		presence.enabled = !presence.enabled

		get(tabs)
		.filter(e => e.presence_id === id)
		.forEach(tab => {
			const enabled = presence.enabled && tab.enabled
			const input = presence.input

			conn.message({
				event: enabled ? 'update' : 'remove',
				tabId: tab.id
			})
			presenceScript.sendMessage(tab.id!,
				enabled ? { type: 'start', input } : { type: 'stop' })
		})

		return presences
	})

const change_input = (presence: Presence, input: string) =>
	state.update(presences => {
		if (!presences) return presences

		presence.input = input

		get(tabs).forEach(tab => {
			if (tab.presence_id === presence.id && tab.enabled)
				presenceScript.sendMessage(tab.id!, { type: 'start', input })
		})

		return presences
	})

const panic = (data: any) => {
	state.set(null)
	bad_data.set(data)
}


export const presences_bad_data = bad_data
export const presences = {
	...state,
	load,
	append,
	remove,
	toggle_enabled,
	change_input,
	panic
}
