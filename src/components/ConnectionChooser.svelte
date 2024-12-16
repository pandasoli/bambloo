<script lang='ts'>
	import { onMount } from 'svelte'

	import { conn } from '@/stores/conn.ts'

	import { ConnMethod, type WSArgs } from '@/models/Conn.ts'

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

	function try_conn() {
		loadingMsgs = Array.from({ length: 4 }, (_, i) => `Connecting to host` + '.'.repeat(i))
		loadingMsgsI = 0

		state = State.Connecing

		chrome.runtime.sendMessage({
			type: `try ${method}`,
			args:
				method === ConnMethod.WebSocket ? ws_conn_args :
				null
		})
			.then(err => {
				state = State.Stopped
				connErr = err
			})
	}

	const onSelect = (item: { value: ConnMethod }) => {
		method = item.value
		connErr = null

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
