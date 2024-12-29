import { writable } from 'svelte/store'

import { set_updatters } from '@/utils/storeUpdaters.ts'
import { ui } from '@/stores/ui.ts'


const state = writable<string|null>(null)
set_updatters(state, 'presence_api')

const load = async () => {
	const repo = 'pandasoli/bambloo-repo'
	const path = 'bambloo.js'
	const res = await fetch(`https://raw.githubusercontent.com/${repo}/refs/heads/master/${path}`)

	if (res.status !== 200) {
		console.error('[Bambloo:presence_api store]', res)
		return ui.setError(
			`Couldn't fetch Bambloo's presence API (<span class='error code'>${res.status}</span>): <span class='error code'>${repo}:${path}</span>`,
			[{ text: 'Retry', outline: true, fn: load }]
		)
	}

	const code = await res.text()
	state.set(code)
}


export const presence_api = {
	...state,
	load
}
