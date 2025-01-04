import { get } from 'svelte/store'
import type { Writable } from 'svelte/store'


export const set_updatters = <T>(state: Writable<T>, name: string) => {
	/* It needs to start as true because when you subscribe
	 * the function is fired as the initial value, which we
	 * don't want to send to the background or to the popup
	 */
	let internal = true

	state.subscribe(content => {
		if (!internal) {
			const data = JSON.parse(JSON.stringify(content))
			browser.runtime.sendMessage({ type: `${name} update`, data })
		}
		else
			internal = false
	})

	browser.runtime.onMessage.addListener(msg => {
		if (msg.type === `${name} update`) {
			internal = true
			state.set(msg.data)
		}
	})

	browser.runtime.onConnect.addListener(() => {
		const data = JSON.parse(JSON.stringify(get(state)))
		browser.runtime.sendMessage({ type: `${name} update`, data })
	})
}
