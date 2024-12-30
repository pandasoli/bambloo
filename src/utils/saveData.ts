import { get } from 'svelte/store'

import { ConnMethod } from '@/models/Conn.ts'

import { presences } from '@/stores/presences.ts'
import { conn } from '@/stores/conn.ts'
import { repos } from '@/stores/repos.ts'
import { alltabs } from '@/stores/alltabs.ts'


export const saveDataLocally = () => {
	// Store data that is required between connections
	const presences_ = get(presences) ?? undefined
	const conn_ = get(conn)
	const repos_ = get(repos)
	const alltabs_ = get(alltabs)

	const method = conn_?.method ?? null
	const args = conn_?.method === ConnMethod.WebSocket ? conn_.args : null

	// Store data
	const data = {
		conn: { method, args },
		repos: repos_,
		alltabs: alltabs_,
		presences: presences_
	}

	// Needed to not overwrite invalid data in storage
	if (!data.presences) delete data.presences

	chrome.storage.local.set(data)
}
