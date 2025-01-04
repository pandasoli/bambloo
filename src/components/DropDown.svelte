<script lang='ts'>
	// based on https://carbon-components-svelte.onrender.com/components/Dropdown

	import type { MouseEventHandler } from 'svelte/elements'

	export let placeholder = ''
	export let items: any[] = []
	export let disabled: boolean = false
	export let selected: number|null = null
	export let onchange: ((item: any) => void)|undefined = undefined

	let main: HTMLElement
	let open: boolean

	const onselect = (i: number) => {
		selected = i
		open = false
		onchange?.(items[i])
	}

	// Close when clicked outside main
	const window_onclick: MouseEventHandler<Window> = ({ target }) => {
		if (!main.contains(target as Node))
			open = false
	}
</script>

<svelte:window on:click={ window_onclick } />

<main bind:this={ main }>
	<button on:click={() => open = !open} {disabled} id='header'>
		<span id='placeholder' class:white={selected !== null}>
			{#if selected == null}
				{placeholder}
			{:else}
				<slot item={items[selected]} />
			{/if}
		</span>

		<svg class:open={open} width='13' height='9' viewBox='0 0 13 9' fill='none' xmlns='http://www.w3.org/2000/svg'>
			<path d='M0.625 0.5L6.10185 7.5L12 0.5' stroke='white'/>
		</svg>
	</button>

	<div id='items' class:open={open}>
		{#each items as item, i}
			<button on:click={() => onselect(i)}>
				<slot {item}/>
			</button>
		{/each}
	</div>
</main>

<style lang='less'>
	main { position: relative }

	#header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 28px;
		width: 100%;
		height: auto;
		padding: 10px;
		border-radius: 4px;
		background: var(--light-bg);

		&:disabled span { opacity: .6 }
		span { text-align: left }
		svg { transition: 500ms transform }
		svg.open { transform: rotate(180deg) }
	}

	#placeholder.white { color: white }

	#items {
		position: absolute;
		border-radius: 4px;
		overflow: hidden;
		top: calc(100% + 4px);
		box-shadow: 1px 2px 4px 2px rgba(0, 0, 0, .2);

		opacity: 0;
		visibility: hidden;
		transition: 500ms opacity;

		button {
			text-align: left;
			width: 100%;
			padding: 10px;
			padding-right: 35px;
			background: var(--light-bg)
		}

		&.open {
			opacity: 1;
			visibility: visible
		}
	}
</style>
