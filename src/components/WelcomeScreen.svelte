<script lang='ts'>
	import type { ChangeEventHandler } from 'svelte/elements'
	import type { ConnMethod } from '@/models/conn.ts'
	import { isConnMethod } from '@/models/conn.ts'

	let method: ConnMethod|null = null

	let connecting = false
	let selectMsg: string|null = null
	let connMsg: string|null = null

	function try_conn(host: string, host_display: string) {
		connMsg = `Connectin' to ${host_display} host`

		chrome.runtime.sendMessage(`try ${host}`)
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
		connecting = true

		switch (method) {
			case 'browser':
				try_conn('browser', 'Browser'); break
			case 'native-messaging':
				try_conn('native-messaging', 'Native Messaging'); break
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
			<option value='ws'              >Web Socket</option>
			<option value='native-messaging'>Native Messaging</option>
		</select>

		{#if selectMsg} <span>{selectMsg}</span> {/if}
	</div>

	<div>
		{#if method === 'native-messaging'}
			{#if connMsg} <span>{connMsg}</span> {/if}
		{/if}

		{#if method === 'ws'}
			{#if connMsg} <span>{connMsg}</span> {/if}
		{/if}
	</div>
</main>
