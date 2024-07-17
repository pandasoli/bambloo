<script lang='ts'>
	import { ui } from '@/stores/ui.ts'
	import { isTab } from '@/models/tab.ts'

	let msg: string|null = null

	const onClick = (e: MouseEvent) => {
		const name = (e.currentTarget as HTMLButtonElement).name

		// Check value matches
		if (!isTab(name))
			return msg = `'${name}' isn't a valid option`

		ui.setTab(name)
	}
</script>

<main>
	<button class:active={$ui.tab === 'presences'} name='presences' on:click={onClick}>Presences</button>
	<button class:active={$ui.tab === 'tabs'}      name='tabs'      on:click={onClick}>Tabs</button>
	<button class:active={$ui.tab === 'store'}     name='store'     on:click={onClick}>Store</button>

	{#if msg}
		<span>{msg}</span>
	{/if}
</main>

<style>
	.active {
		background-color: blue;
	}
</style>
