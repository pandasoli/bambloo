<script lang='ts'>
	import WelcomeScreen from '@/Welcome.svelte'
  import PresencesTab from '@/Presences.svelte'
	import TabsTab from '@/Tabs.svelte'
	import SettingsScreen from '@/Settings.svelte'
	import Header from '@/components/Header.svelte'
	import Store from '@/components/Store.svelte'
	import Button from '@/components/Button.svelte'

	import { conn } from '@/stores/conn.ts'
	import { ui } from '@/stores/ui.ts'
	import { popup } from '@/stores/popup.ts'
	import { presences } from '@/stores/presences.ts'

	import { AppTab } from '@/models/AppTab.ts'
	import { ConnState } from '@/models/Conn.ts'

	import presencesTreeIcon from '@/assets/trees/presences.png'
	import storeTreeIcon from '@/assets/trees/store.png'


	const errorRetry = (index: number) =>
		chrome.runtime.sendMessage({ type: 'error', index })


	popup.subscribe(() =>
		setTimeout(() =>
			popup.set([]), 10_000))

	chrome.runtime.connect()
</script>

<div id='popup-container'>
	{#each $popup as msg}
		<div class='popup'>
			<span>{@html msg}</span>
		</div>
	{/each}
</div>	

{#if $ui.error}
	<div class='err-panel'>
		<span class='error'>{@html $ui.error.msg }</span>

		<div class='buttons'>
			{#each $ui.error.buttons as btn, i}
				<Button type='red' onclick={() => errorRetry(i)} outline={btn.outline}>{ btn.text }</Button>
			{/each}
		</div>
	</div>
{:else if $conn?.state !== ConnState.Connected}
	<WelcomeScreen />
{:else}
	{#if $presences?.length === 0}
		<img src={presencesTreeIcon} id='tree' />
		<Store />
	{:else}
		<Header />

		{#if      $ui.tab === AppTab.Presences} <PresencesTab />
		{:else if $ui.tab === AppTab.Tabs     } <TabsTab />
		{:else if $ui.tab === AppTab.Store    }
			<img src={storeTreeIcon} id='tree' />
			<Store />
		{/if}
	{/if}

	{#if $ui.config_open}
		<SettingsScreen close={ui.toggleConfigOpen}/>
	{/if}
{/if}

<style lang='scss'>
	#popup-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 99
	}

	.popup {
		padding: 2px 6px;
		text-align: center;
		background: orange;
		font-size: 10px;

		span { color: black }
	}

	.err-panel {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 8px;
		height: 100%;

		.buttons { width: 80% }
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
