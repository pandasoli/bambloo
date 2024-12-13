<script lang='ts'>
	import type { ConnMethod, WSArgs } from '@/models/conn.ts'
	import { isConnMethod } from '@/models/conn.ts'
	import DropDown from '@/components/DropDown.svelte'

	// Used for "..." animation
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'

	let connMsgs: string[] = []
	let connMsgsIndex = 0

	let method: ConnMethod|null = null

	let connecting = false
	let connErr: string|null = null

	let ws_conn_args: WSArgs = { port: 8765 }

	function try_conn(host: string, host_display: string) {
		// Setting for "..."-animation messages
		connMsgs = []
		connMsgsIndex = 0

		for (let i = 0; i < 4; ++i)
			connMsgs.push(`Connectin' to ${host_display} host` + Array(i).fill('.').join(''))

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

<img src='/trees/welcome.png' id='tree' />
<img src='/logo_discord-blue.png' id='logo' />

<main>
	<h1>Welcome!</h1>

	<div>
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
					<button class='active' on:click={connect}>Connect</button>
				</div>
			{/if}

			{#if connecting} <span class='info' transition:fade>{connMsgs[connMsgsIndex]}</span> {/if}
			{#if connErr} <span class='error'>{connErr}</span> {/if}
		</div>
	</div>
</main>

<style lang='scss'>
	main {
		height: 332px;
		width: 228px
	}

	h1 {
		color: white;
		margin-bottom: 120px;
		font-weight: 400;
		font-size: 28px
	}

	#tree {
		position: absolute;
		width: 238px;
		top: 0;
		right: 0;
		mix-blend-mode: lighten
	}

	#logo {
		position: absolute;
		height: 100px;
		width: 131px;
		right: -35px;
		bottom: 0;
		object-fit: cover;
		z-index: 99
	}

	#aux {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-block: 10px;

		div {
			display: flex;
			align-items: center;
			gap: 10px
		}
	}
</style>
