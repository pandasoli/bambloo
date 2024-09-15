import type { BrowserArgs } from '@/models/conn.ts'


export const connect_browser = (args: BrowserArgs) => new Promise<{ ctx: chrome.runtime.ExtensionContext|null, err: string|null }>(async resolve => {
	const url = chrome.runtime.getURL('browser_offscreen.html')

	const getContexts = async () =>
		await chrome.runtime.getContexts({
			contextTypes: [ chrome.runtime.ContextType.OFFSCREEN_DOCUMENT ]
		})

	if ((await getContexts()).length > 0)
		return resolve({ ctx: null, err: "There's already an offscreen document" })

	await chrome.offscreen.createDocument({
		url,
		reasons: [ chrome.offscreen.Reason.DOM_SCRAPING ],
		justification: 'Parse DOM'
	})

	const ctxs = await getContexts()

	if (ctxs.length === 0)
		return resolve({ ctx: null, err: 'Document not created' })

	chrome.runtime.onMessage.addListener(msg => {
		if (msg.type !== 'background') return
		console.log(msg)
	})

	chrome.runtime.sendMessage({ type: 'offscreen', args })
	resolve({ ctx: ctxs[0], err: null })
})
