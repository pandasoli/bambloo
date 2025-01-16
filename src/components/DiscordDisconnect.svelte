<script lang='ts'>
	import discordBlueIcon from '@/assets/discord_blue.svg'
	import reloadIcon from '@/assets/reload.svg'

	import { conn } from '@/stores/conn.ts'

	import { DiscordState } from '@/models/DiscordState.ts'


	const reconnectDiscord = () =>
		browser.runtime.sendMessage({ type: 'reconnect discord' })
</script>

<div id='discord-connection' class:invalid={$conn?.discordState === DiscordState.Disconnected}>
	<img src={discordBlueIcon} alt='Discord icon' />

	<div>
		<span>Discord has disconnected</span>

		{#if $conn?.errMsg}
			<details>
				<summary>Details</summary>
				<p>{ $conn.errMsg }</p>
			</details>
		{/if}
	</div>

	{#if $conn?.discordState === DiscordState.Disconnected}
		<button on:click={reconnectDiscord} aria-label='Reconnect'>
			<img src={reloadIcon} alt='Reconnect icon' />
		</button>
	{:else}
		<div class='loading'>
			<div></div>
			<div></div>
			<div></div>
		</div>
	{/if}
</div>

<style lang='less'>
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

		&.invalid {
			animation: invalid .6s ease-in-out;
		}
	}

	img { width: 22px; height: 38px }

	#discord-connection > div:first-of-type {
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
		height: 38px;
		width: 38px;
		gap: 4px
	}

	button {
		cursor: pointer;

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

	@keyframes invalid {
		0%, 100% { transform: translateX(-5%) }
		30% { transform: translateX(-5% + -4px) }
		70% { transform: translateX(-5% + 4px) }
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0) }
		80% { transform: translateY(2px) }
		40% { transform: translateY(-10px) }
	}
</style>
