
export const updateGlobal = (state: any, store: string) => {
	const data = JSON.parse(JSON.stringify(state))
	const msg = { type: `${store} update`, data }

	/* When popup not open this error's thrown (no worry):
	 *   Uncaught (in promise) Error: Could not establish
	 *   connection. Receiving end does not exist.
	 */
	chrome.runtime.sendMessage(msg)
}
