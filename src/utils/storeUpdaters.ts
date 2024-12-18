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
			chrome.runtime.sendMessage({ type: `${name} update`, data })
		}
		else
			internal = false
	})

	chrome.runtime.onMessage.addListener(msg => {
		if (msg.type === `${name} update`) {
			internal = true
			state.set(msg.data)
		}
	})
}
