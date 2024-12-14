<script lang='ts'>
	import { ui } from '@/stores/ui.ts'
	import { isTab } from '@/models/AppTab.ts'

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
	<button class={$ui.tab === 'presences' ? 'active' : 'inactive'} name='presences' on:click={onClick}>Presences</button>
	<button class={$ui.tab === 'tabs'      ? 'active' : 'inactive'} name='tabs'      on:click={onClick}>Tabs</button>
	<button class={$ui.tab === 'store'     ? 'active' : 'inactive'} name='store'     on:click={onClick}>Store</button>

	{#if msg} <span class='error'>{msg}</span> {/if}
</main>

<style>
	main {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		padding-block: 7px
	}

	button {
		height: 20px;
		width: 70px;
		font-size: 10px
	}
</style>
