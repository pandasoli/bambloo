<script lang='ts'>
	import type { MouseEventHandler } from 'svelte/elements'

	export let checked: boolean = false
	export let onchange: ((checked: boolean) => void)|undefined = undefined

	const onclick: MouseEventHandler<HTMLButtonElement> = () => {
		checked = !checked
		onchange?.(checked)
	}
</script>

<button class:checked={checked} on:click={onclick}>
	<svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M1 5.61364L3.3126 8.94779C3.36091 9.01734 3.4392 9.01746 3.48752 8.94779L9 1' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
	</svg>
</button>

<style lang='less'>
	button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 22px;
		height: 22px;
		border-radius: 6px;
		background: var(--light-bg);

		&.checked { background: var(--blue) }
	}
</style>
