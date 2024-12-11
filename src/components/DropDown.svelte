<script lang='ts'>
	// based on https://carbon-components-svelte.onrender.com/components/Dropdown

	import type { MouseEventHandler } from 'svelte/elements'

	export let placeholder = ''
	export let items: any[] = []
	export let disabled: boolean = false
	export let onchange: ((item: any) => void)|undefined = undefined

	let open: HTMLInputElement
	let main: HTMLElement
	let selected: any|null = null

	const onselect = (item: any) => {
		selected = item
		open.checked = false
		onchange?.(item)
	}

	// Close when clicked outside main
	const window_onclick: MouseEventHandler<Window> = ({ target }) => {
		if (!main.contains(target as Node))
			open.checked = false
	}
</script>

<svelte:window on:click={ window_onclick } />

<main bind:this={ main }>
	<input type='checkbox' id='open' {disabled} bind:this={open} />

	<header>
		<label for='open'>
			<span id='placeholder' aria-invalid={selected == null}>
				{#if selected == null}
					{placeholder}
				{:else}
					<slot item={selected} />
				{/if}
			</span>

			<svg width='13' height='9' viewBox='0 0 13 9' fill='none' xmlns='http://www.w3.org/2000/svg'>
				<path d='M0.625 0.5L6.10185 7.5L12 0.5' stroke='white'/>
			</svg>
		</label>
	</header>	

	<div id='items'>
		{#each items as item}
			<button on:click={() => onselect(item)}>
				<slot {item}/>
			</button>
		{/each}
	</div>
</main>

<style lang='scss'>
	#open { display: none }
	#open:checked ~ #items {
		opacity: 1;
		visibility: visible
	}
	#open:checked ~ header label svg {
		transform: rotate(180deg)
	}
	#open:disabled ~ header label {
		opacity: .6
	}

	main {
		position: relative
	}

	header {
		border-radius: 4px;
		overflow: hidden;
		background: var(--light-bg);
		width: 100%;

		label {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 28px;

			padding: 10px;

			svg {
				transition: 500ms transform
			}
		}
	}	

	#items {
		position: absolute;
		border-radius: 4px;
		overflow: hidden;
		top: calc(100% + 4px);

		opacity: 0;
		visibility: hidden;
		transition: 500ms opacity;

		button {
			border-radius: 0;
			height: auto;

			text-align: left;
			width: 100%;
			padding: 10px;
			padding-right: 35px;
			background: var(--light-bg)
		}
	}
</style>
