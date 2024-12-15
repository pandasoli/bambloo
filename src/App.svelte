<script lang='ts'>
	import WelcomeScreen from '@/Welcome.svelte'
  import PresencesTab from '@/Presences.svelte'
	import TabsTab from '@/Tabs.svelte'
	import Header from '@/components/Header.svelte'
	import Store from '@/components/Store.svelte'

	import { conn } from '@/stores/conn.ts'
	import { ui } from '@/stores/ui.ts'
	import { popup } from '@/stores/popup.ts'
	import { presences } from '@/stores/presences.ts'

	import presencesTreeIcon from '@/assets/trees/presences.png'
	import storeTreeIcon from '@/assets/trees/store.png'

	import SettingsScreen from '@/Settings.svelte'


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
			<img src={presencesTreeIcon} id='tree' />
			<Store />
		{:else}
			<Header />

			{#if      $ui.tab === 'presences'} <PresencesTab />
			{:else if $ui.tab === 'tabs'     } <TabsTab />
			{:else if $ui.tab === 'store'    }
				<img src={storeTreeIcon} id='tree' />
				<Store />
			{/if}
		{/if}
	{/if}
</main>

{#if $ui.config_open}
	<SettingsScreen close={ui.toggleConfigOpen}/>
{/if}

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
		padding: 22px 26px;
		height: 100%;

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
		mix-blend-mode: lighten;
		image-rendering: pixelated
	}
</style>
