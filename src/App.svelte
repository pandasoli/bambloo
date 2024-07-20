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
	{#each $popup as msg}
		<div>
			<span>{msg}</span>
		</div>
	{/each}

	{#if !$conn?.connected}
		<WelcomeScreen />
	{:else if $presences === null}
		<StoreScreen />
	{:else}
		<Header />
		<span>Connected</span>
	{/if}
</main>
