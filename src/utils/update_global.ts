
export const updateGlobal = (state: any, datatype: string) => {
	const data = JSON.parse(JSON.stringify(state))
	const msg = { type: `${datatype} update`, data }

	chrome.runtime.sendMessage(msg)
}
