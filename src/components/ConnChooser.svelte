<script lang='ts'>
	import { onMount } from 'svelte'

	import { conn } from '@/stores/conn.ts'

	import { ConnMethod, ConnState, type WebSocketArgs } from '@/models/Conn.ts'

	import DropDown from '@/components/DropDown.svelte'
	import Button from '@/components/Button.svelte'


	let state: ConnState
	$: state = $conn?.state ?? ConnState.Stopped

	let errMsg: string|null
	$: errMsg = $conn?.errMsg ?? null

	let loadingMsgs: string[] = [] // Used for "..." animation
	let loadingMsgsI = 0
	$: {
		loadingMsgsI = 0
		let text = ''

		if (state === ConnState.Connected)
			loadingMsgs = ['Connected']
		else {
			switch (state) {
				case ConnState.Connecting: text = 'Connecting to host'; break
				case ConnState.WaitingDetails: text = 'Waiting for connection details'; break
			}

			loadingMsgs = Array.from({ length: 4 }, (_, i) => text + '.'.repeat(i))
		}
	}

	let method: ConnMethod|null
	$: method = $conn?.method ?? null

	let ws_conn_args: WebSocketArgs = { port: 8765 }

	browser.runtime.onMessage.addListener(msg => {
		switch (msg.type) {
			case 'conn state update':
				state = msg.state
		}
	})

	function try_conn() {
		state = ConnState.Connecting
		errMsg = null

		browser.runtime.sendMessage({
			type: 'connect',
			method,
			args:
				method === ConnMethod.WebSocket ? ws_conn_args :
				null
		})
			.then(err => {
				if (err) {
					state = ConnState.Stopped
					errMsg = err
				}
			})
	}

	const onSelect = (item: { value: ConnMethod }) => {
		method = item.value
		errMsg = ''

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
		selected={method}
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
				<Button type='blue' biggy onclick={connect}>Connect</Button>
			</div>
		{/if}

		{#if state !== ConnState.Stopped}
			<span class='info'>{loadingMsgs[loadingMsgsI]}</span>
		{:else if errMsg}
			<span class='error'>{errMsg}</span>
		{/if}
	</div>
</main>

<style lang='less'>
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
