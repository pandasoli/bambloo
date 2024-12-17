<script lang='ts'>
	import { onMount } from 'svelte'

	import { conn } from '@/stores/conn.ts'

	import { ConnMethod, ConnState, type WebSocketArgs } from '@/models/Conn.ts'

	import DropDown from '@/components/DropDown.svelte'
	import Button from '@/components/Button.svelte'


	let state: ConnState = ConnState.Stopped
	let errMsg: string|null = null

	let loadingMsgs: string[] = [] // Used for "..." animation
	let loadingMsgsI = 0

	let method: ConnMethod|null = null
	let ws_conn_args: WebSocketArgs = { port: 8765 }

	chrome.runtime.onMessage.addListener(msg => {
		if (msg.type === 'conn state update') {
			state = msg.state
			loadingMsgsI = 0

			if (state === ConnState.WaitingDetails)
				loadingMsgs = Array.from({ length: 4 }, (_, i) => `Waiting for connection details` + '.'.repeat(i))
			else if (state === ConnState.Connected)
				loadingMsgs = ['Connected']
		}
	})

	function try_conn() {
		loadingMsgs = Array.from({ length: 4 }, (_, i) => `Connecting to host` + '.'.repeat(i))
		loadingMsgsI = 0

		state = ConnState.Connecting
		errMsg = null

		chrome.runtime.sendMessage({
			type: 'connect',
			method,
			set_first: $conn === null,
			args:
				method === ConnMethod.WebSocket ? ws_conn_args :
				null
		})
			.then(err => {
				state = ConnState.Stopped
				errMsg = err
			})
	}

	const onSelect = (item: { value: ConnMethod }) => {
		method = item.value

		// Call connecion function
		switch (method) {
			case ConnMethod.NativeMessaging: try_conn()
		}
	}

	const connect = () => {
		switch (method) {
			case ConnMethod.WebSocket: try_conn()
		}
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
		disabled={state === ConnState.Connecting || state === ConnState.WaitingDetails}
		onchange={onSelect}
		items={[
			{value: ConnMethod.NativeMessaging, text: 'Native Messaging'},
			{value:	ConnMethod.WebSocket, text: 'Web Socket'}
		]}
		let:item
	>
		{item.text}
	</DropDown>

	<div id='aux'>
		{#if method === ConnMethod.WebSocket}
			<div>
				<input bind:value={ws_conn_args.port} type='number' placeholder='Port'/>
				<Button type='blue' onclick={connect}>Connect</Button>
			</div>
		{/if}

		{#if state !== ConnState.Stopped} <span class='info'>{loadingMsgs[loadingMsgsI]}</span> {/if}
		{#if errMsg} <span class='error'>{errMsg}</span> {/if}
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
