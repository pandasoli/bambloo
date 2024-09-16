<script lang='ts'>
	import type { ChangeEventHandler } from 'svelte/elements'
	import type { ConnMethod, BrowserArgs, WSArgs } from '@/models/conn.ts'
	import { isConnMethod } from '@/models/conn.ts'

	let method: ConnMethod|null = null

	let connecting = false
	let selectMsg: string|null = null
	let inputMsg: string|null = null
	let connMsg: string|null = null

	let browser_conn_args: BrowserArgs = { authentication_token: '' }
	let ws_conn_args: WSArgs = { port: 8765 }

	function try_conn(host: string, host_display: string) {
		connMsg = `Connectin' to ${host_display} host`
		connecting = true

		chrome.runtime.sendMessage({
			type: `try ${host}`,
			args:
				method === 'browser' ? browser_conn_args :
				method === 'ws'      ? ws_conn_args :
				null
		})
			.then(err => {
				connecting = false
				connMsg = err
			})
	}

	const onSelect: ChangeEventHandler<HTMLSelectElement> = e => {
		const value = e.currentTarget.value

		// Check value matches type
		if (!isConnMethod(value))
			return selectMsg = `'${value}' isn't a valid option`

		method = value

		// Call connecion function
		switch (method) {
			case 'native-messaging':
				try_conn('native-messaging', 'Native Messaging')
		}
	}

	const connect = () => {
		switch (method) {
			case 'browser':
				if (browser_conn_args.authentication_token.length === 0)
					return inputMsg = 'Missing authentication token'

				try_conn('browser', 'Browser'); break
			case 'ws':
				try_conn('ws', 'WebSocket')
		}
	}
</script>

<main>
	<div>
		<select on:change={onSelect} disabled={connecting}>
			<option value='none'            >None</option>
			<option value='browser'         >Browser</option>
			<option value='native-messaging'>Native Messaging</option>
			<option value='ws'              >Web Socket</option>
		</select>

		{#if selectMsg} <span>{selectMsg}</span> {/if}
	</div>

	<div>
		{#if method === 'browser'}
			<input bind:value={browser_conn_args.authentication_token} type='text' placeholder='Authentication token'/>
			{#if inputMsg} <span>{inputMsg}</span> {/if}
			<button on:click={connect}>Connect</button>
		{/if}

		{#if method === 'ws'}
			<input bind:value={ws_conn_args.port} type='number' placeholder='Port'/>
			<button on:click={connect}>Connect</button>
		{/if}

		{#if connMsg} <span>{connMsg}</span> {/if}
	</div>
</main>
