<script lang='ts'>
	import { onMount } from 'svelte'

	import { conn } from '@/stores/conn.ts'

	import type { ConnMethod, WSArgs } from '@/models/conn.ts'
	import { isConnMethod } from '@/models/conn.ts'

	import DropDown from '@/components/DropDown.svelte'
	import Button from '@/components/Button.svelte'


	enum State { Stopped, Connecing, WaitingDetails }


	let state: State = State.Stopped

	let loadingMsgs: string[] = [] // Used for "..." animation
	let loadingMsgsI = 0

	let method: ConnMethod|null = null
	let connErr: string|null = null
	let ws_conn_args: WSArgs = { port: 8765 }

	chrome.runtime.onMessage.addListener(msg => {
		if (msg.to !== 'connectionchooser') return
		if (msg.state === 'waiting for details') {
			state = State.WaitingDetails
			loadingMsgs = Array.from({ length: 4 }, (_, i) => `Waiting for connection details` + '.'.repeat(i))
		}
	})

	function try_conn(host: string, host_display: string) {
		loadingMsgs = Array.from({ length: 4 }, (_, i) => `Connectin' to ${host_display} host` + '.'.repeat(i))
		loadingMsgsI = 0

		state = State.Connecing

		chrome.runtime.sendMessage({
			type: `try ${host}`,
			args:
				method === 'ws' ? ws_conn_args :
				null
		})
			.then(err => {
				state = State.Stopped
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

	const stop = () => {
		conn.stop()
		state = State.Stopped
	}

	onMount(() => {
		const interval = setInterval(() =>
			loadingMsgsI = (loadingMsgsI + 1) % loadingMsgs.length
		, 500)

		return () => clearInterval(interval)
	})
</script>

<main>
	<DropDown
		placeholder='Select connection method'
		disabled={state !== State.Stopped}
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
		
		{#if state === State.WaitingDetails}
			<Button type='red' outline onclick={stop}>Cancel</Button>
		{/if}

		{#if state} <span class='info'>{loadingMsgs[loadingMsgsI]}</span> {/if}
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
