<script lang='ts'>
	import WelcomeScreen from '@/components/WelcomeScreen.svelte'
	import { conn } from '@/stores/conn.ts'
	import { popup } from '@/stores/popup.ts'

	popup.subscribe(() =>
		setTimeout(() =>
			popup.change(null), 3000))

	chrome.runtime.connect()
</script>

<main>
	<div>
		<span>{$popup ?? ''}</span>
	</div>

	{#if !$conn?.connected}
		<WelcomeScreen />
	{:else}
		<span>Connected</span>
	{/if}
</main>
