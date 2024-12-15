<script lang='ts'>
	import type { MouseEventHandler } from 'svelte/elements'

	export let type: 'blue'|'red'|undefined = undefined
	export let outline: boolean|undefined = undefined
	export let inactive: boolean|undefined = false
	export let onclick: MouseEventHandler<HTMLButtonElement>|undefined = undefined
</script>

<button
	class:red={type === 'red'}
	class:blue={type === 'blue'}
	class:outline={outline}
	class:inactive={inactive}
	on:click={onclick}
	{ ...$$restProps }
>
	<slot />
</button>

<style lang='scss'>
	button {
		display: block;
		border: none;
		font-size: 10pt;
		border-radius: 4px;
		height: 26px;

		font-weight: bold;
		transition: 500ms background;

		&.blue { background: var(--blue); &:hover { background: var(--blue) }}
		&.red { background: var(--red); &:hover { background: var(--red) }}

		&.outline { background: none; font-weight: normal }
		&.blue.outline { box-shadow: inset 0 0 0 1px var(--blue) }
		&.red.outline { box-shadow: inset 0 0 0 1px var(--red) }

		&.blue.inactive, &.blue:disabled { background: var(--light-bg); color: var(--header-text-cl) }
		&.red.inactive, &.red:disabled { background: var(--dark-red); color: var(--header-text-cl) }
		&.outline.inactive, &.outline:disabled { box-shadow: none }
	}
</style>
