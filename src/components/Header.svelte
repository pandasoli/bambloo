<script lang='ts'>
	import { ui } from '@/stores/ui.ts'

	import { AppTab } from '@/models/AppTab.ts'

	import Button from '@/components/Button.svelte'


	/* Way of getting a string list of an enum */
	const tabs = Object.values(AppTab) as AppTab[]
</script>

<main>
	{#each tabs as tab}
		<Button
			type='blue'
			class='HeaderButton'
			inactive={$ui.tab !== tab}
			onclick={() => ui.setTab(tab)}
		>
			{ tab }
		</Button>
	{/each}
</main>

<style>
	main {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		padding-block: 7px
	}

	:global(.HeaderButton) {
		height: 20px !important;
		width: 70px;
		font-size: 10px !important;
		text-transform: capitalize
	}
</style>
