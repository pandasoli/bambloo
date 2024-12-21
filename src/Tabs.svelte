<script lang='ts'>
	import { alltabs } from '@/stores/alltabs.ts'
	import { tabs } from '@/stores/tabs.ts'
	import { popup } from '@/stores/popup.ts'
	import { conn } from '@/stores/conn.ts'

	import type { Tab } from '@/models/Tab.ts'

	import Switch from '@/components/Switch.svelte'
	import InfoButton from '@/components/InfoButton.svelte'

	import treeIcon from '@/assets/trees/tabs.png'
	import worldIcon from '@/assets/world.svg'


	const toggle = (tab: Tab) => {
		if (tab.id === undefined) {
			popup.append('Cannot toggle tab with no id')
			console.error('Cannot toggle tab with no id', tab)
			return
		}

		tabs.toggle_enabled(tab.id)
	}
</script>

<img src={treeIcon} id='tree' />

<main>
	{#if $conn?.details.multiple}
		<div id='options'>
			<div />
			<div>
				<span>Current tab</span>
				<Switch enabled={$alltabs} onchange={() => alltabs.toggle()} />
				<span>All tabs</span>
			</div>
			<div>
				<InfoButton>
					Only the allowed focused
					tab to be shown on Discord
					or all allowed tabs
				</InfoButton>
			</div>
		</div>
	{/if}

	<div>
		{#each $tabs as tab, i}
			<div class='tab'>
				<img src={tab.favIconUrl || worldIcon} />
				<span>{tab.title}</span>
				<Switch enabled={tab.enabled} onchange={() => toggle(tab)} />
			</div>

			{#if i < $tabs.length - 1} <hr /> {/if}
		{/each}
	</div>
</main>

<style lang='scss'>
	#tree {
		position: absolute;
		width: 261px;
		top: 0;
		right: 0;
		mix-blend-mode: lighten;
		image-rendering: pixelated
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 8px
	}

	#options {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding-block: 8px;

		div:nth-child(2) {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px
		}

		span { color: white }
	}

	.tab {
		display: flex;
		gap: 10px;
		padding: 3px 6px;

		img {
			width: 30px;
			height: 30px;
			border-radius: 6px
		}

		span {
			margin-top: 2px;
			color: white;
			flex: 1
		}
	}
</style>
