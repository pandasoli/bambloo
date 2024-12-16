<script lang='ts'>
	import { onMount } from 'svelte'

	import type { ConnMethod, WSArgs } from '@/models/conn.ts'
	import { isConnMethod } from '@/models/conn.ts'

	import DropDown from '@/components/DropDown.svelte'
	import Button from '@/components/Button.svelte'


	let connMsgs: string[] = [] // Used for "..." animation
	let connMsgsIndex = 0

	let method: ConnMethod|null = null

	let connecting = false
	let connErr: string|null = null

	let ws_conn_args: WSArgs = { port: 8765 }

	function try_conn(host: string, host_display: string) {
		// Setting for "..."-animation messages
		connMsgs = Array.from({ length: 4 }, (_, i) => `Connectin' to ${host_display} host` + '.'.repeat(i))
		connMsgsIndex = 0

		connecting = true

		chrome.runtime.sendMessage({
			type: `try ${host}`,
			args:
				method === 'ws' ? ws_conn_args :
				null
		})
			.then(err => {
				connecting = false
				connErr = err
			})
	}

	const onSelect = (item: { value: string }) => {
		const value = item.value

		connErr = null
		method = null

		// Check value matches type
		if (!isConnMethod(value))
			return console.warn('[WelcomeScreen:onSelect]', `'${value}' isn't a valid option`)

		method = value

		// Call connecion function
		switch (method) {
			case 'native-messaging':
				try_conn('native-messaging', 'Native Messaging')
		}
	}

	const connect = () => {
		switch (method) {
			case 'ws':
				try_conn('ws', 'WebSocket')
		}
	}

	onMount(() => {
		const interval = setInterval(() =>
			connMsgsIndex = (connMsgsIndex + 1) % connMsgs.length
		, 500)

		return () => clearInterval(interval)
	})
</script>

<main>
	<DropDown
		placeholder='Select connection method'
		disabled={connecting}
		onchange={onSelect}
		items={[
			{value: 'native-messaging', text: 'Native Messaging'},
			{value:	'ws', text: 'Web Socket'}
		]}
		let:item
	>
		{item.text}
	</DropDown>

	<div id='aux'>
		{#if method === 'ws'}
			<div>
				<input bind:value={ws_conn_args.port} type='number' placeholder='Port'/>
				<Button type='blue' onclick={connect}>Connect</Button>
			</div>
		{/if}

		{#if connecting} <span class='info'>{connMsgs[connMsgsIndex]}</span> {/if}
		{#if connErr} <span class='error'>{connErr}</span> {/if}
	</div>
</main>

<style lang='scss'>
	#aux {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-block: 10px;

		div {
			display: grid;
			grid-template-columns: 2fr 1fr;
			align-items: center;
			gap: 10px
		}
	}
</style>
