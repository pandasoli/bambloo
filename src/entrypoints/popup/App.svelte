<script lang='ts'>
	import WelcomeScreen from '@/entrypoints/Welcome.svelte'
  import PresencesTab from '@/entrypoints/Presences.svelte'
	import TabsTab from '@/entrypoints/Tabs.svelte'
	import SettingsScreen from '@/entrypoints/Settings.svelte'
	import Header from '@/components/Header.svelte'
	import Store from '@/components/Store.svelte'
	import Button from '@/components/Button.svelte'

	import { conn } from '@/stores/conn.ts'
	import { ui } from '@/stores/ui.ts'
	import { popup } from '@/stores/popup.ts'
	import { presences } from '@/stores/presences.ts'

	import { AppTab } from '@/models/AppTab.ts'
	import { ConnState } from '@/models/Conn.ts'
	import { DiscordState } from '@/models/DiscordState.ts'

	import presencesTreeIcon from '@/assets/trees/presences.png'
	import storeTreeIcon from '@/assets/trees/store.png'
	import discordBlueIcon from '@/assets/discord_blue.svg'
	import reloadIcon from '@/assets/reload.svg'


	const errorRetry = (index: number) =>
		browser.runtime.sendMessage({ type: 'error', index })

	const reconnectDiscord = () =>
		browser.runtime.sendMessage({ type: 'reconnect discord' })


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

		<div class={`buttons ${$ui.error.buttons.length > 1 ? 'btns-2' : ''}`}>
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
		{#if $conn.discordState !== DiscordState.Connected}
			<div id='discord-connection'>
				<img src={discordBlueIcon} />

				<div>
					<span>Discord has disconnected</span>

					{#if $conn.errMsg}
						<details>
							<summary>Details</summary>
							<p>{ $conn.errMsg }</p>
						</details>
					{/if}
				</div>

				{#if $conn.discordState === DiscordState.Disconnected}
					<button on:click={reconnectDiscord}>
						<img src={reloadIcon} />
					</button>
				{:else}
					<div class='loading'>
						<div />
						<div />
						<div />
					</div>
				{/if}
			</div>
		{/if}

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

<style lang='less'>
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

	#discord-connection {
		display: flex;
		align-items: start;
		gap: 10px;
		padding: 6px;
		width: 110%;
		min-height: 50px;
		transform: translateX(-5%);
		border-radius: 8px;
		z-index: 1;
		background: var(--light-bg);

		img { width: 22px; height: 38px }

		& > div:first-of-type {
			display: flex;
			flex-direction: column;
			flex: 1;

			span { flex: 1; color: white }
			summary { color: var(--text-cl) }
		}

		button, .loading {
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
			height: 38px;
			width: 38px;
			gap: 4px
		}

		button {
			img { width: 60% }

			&:hover { opacity: .75 }
		}

		.loading div {
			width: 5px;
			height: 5px;
			border-radius: 50%;
			background: var(--blue);
			animation: bounce 1.5s infinite ease-in-out;

			&:nth-child(2) { animation-delay: .2s }
			&:nth-child(3) { animation-delay: .4s }
		}
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0) }
		80% { transform: translateY(2px) }
		40% { transform: translateY(-10px) }
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
