
export const connect_native = () => new Promise<{ port: chrome.runtime.Port, err: string|null }>(resolve => {
	const port = chrome.runtime.connectNative('com.elisoli.chrome.echo')

	const onMsg = (msg: string) => {
		if (msg !== 'test') return

		port.onMessage.removeListener(onMsg)
		port.onDisconnect.removeListener(onDisco)
		resolve({ port, err: null })
	}

	const onDisco = () => {
		port.onMessage.removeListener(onMsg)
		port.onDisconnect.removeListener(onDisco)
		resolve({ port, err: chrome.runtime.lastError?.message ?? null })
	}

	port.onMessage.addListener(onMsg)
	port.onDisconnect.addListener(onDisco)
	port.postMessage('test')
})

