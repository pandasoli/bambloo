<script lang='ts'>
	import WelcomeScreen from '@/components/WelcomeScreen.svelte'
	import Store from '@/components/Store.svelte'
	import Header from '@/components/Header.svelte'
  import PresencesTab from '@/components/PresencesTab.svelte'
  import TabsTab from '@/components/TabsTab.svelte'
	import { conn } from '@/stores/conn.ts'
	import { ui } from '@/stores/ui.ts'
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
	{:else}
		{#if $presences?.length === 0}
			<img src='/trees/presences.png' id='tree' />
			<Store />
		{:else}
			<Header />

			{#if      $ui.tab === 'presences'} <PresencesTab />
			{:else if $ui.tab === 'tabs'     } <TabsTab />
			{:else if $ui.tab === 'store'    }
				<img src='/trees/store.png' id='tree' />
				<Store />
			{/if}
		{/if}
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

	main {
		/* Size of main screen */
		width: 228px;
		height: 378px;

		display: flex;
		flex-direction: column;
		gap: 12px;

		& > main { z-index: 1 }
	}

	#tree {
		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
		mix-blend-mode: lighten
	}
</style>
