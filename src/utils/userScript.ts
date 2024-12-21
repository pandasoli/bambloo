import type { Presence } from '@/models/Presence.ts'


export const register = async (presence: Presence) => {
	const res = await fetch(presence.script)
	const text = await res.text()

	const code = text
		.split('\n')
		.slice(0, -2)
		.join('\n')

	chrome.userScripts.register([{
		id: presence.id.toString(),
		world: 'USER_SCRIPT',
		matches: presence.urls,
		runAt: 'document_start',
		js: [{ code }]
	}])
}

export const unregister = (presence: Presence) =>
	chrome.userScripts.unregister({
		ids: [ presence.id.toString() ]
	})
