<script lang='ts'>
	import WelcomeScreen from '@/components/WelcomeScreen.svelte'
	import StoreScreen from '@/components/StoreScreen.svelte'
	import Header from '@/components/Header.svelte'
	import { conn } from '@/stores/conn.ts'
	import { popup } from '@/stores/popup.ts'
	import { presences } from '@/stores/presences.ts'

	popup.subscribe(() =>
		setTimeout(() =>
			popup.change([]), 10_000))

	chrome.runtime.connect()
</script>

<main>
	<div id='popup-container'>
		{#each $popup as msg}
			<div class='popup'>
				<span>{msg}</span>
			</div>
		{/each}
	</div>	

	{#if !$conn?.connected}
		<WelcomeScreen />
	{:else if $presences === null}
		<StoreScreen />
	{:else}
		<Header />
		<span>Connected</span>
	{/if}
</main>

<style>
	#popup-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 99
	}

	.popup {
		padding-block: 2px;
		text-align: center;
		background: orange
	}
</style>
