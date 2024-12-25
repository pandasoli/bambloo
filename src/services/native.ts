import type { ConnDetails } from '@/models/Conn.ts'


type DetailsPromise = Promise<{ details: ConnDetails } | { err: string }>

type Res = {
	port: chrome.runtime.Port
	details: DetailsPromise
}


export const connect_native = (): Res => {
	const port = chrome.runtime.connectNative('com.elisoli.chrome.echo')

	const details: DetailsPromise = new Promise(resolve => {
		const onMsg = (details: ConnDetails) => {
			port.onMessage.removeListener(onMsg)
			port.onDisconnect.removeListener(onDisco)
			resolve({ details })
		}

		const onDisco = () => {
			port.onMessage.removeListener(onMsg)
			port.onDisconnect.removeListener(onDisco)
			resolve({ err: chrome.runtime.lastError?.message ?? "Couldn't connect to native messaging host" })
		}

		port.onMessage.addListener(onMsg)
		port.onDisconnect.addListener(onDisco)
	})

	return {port, details}
}
