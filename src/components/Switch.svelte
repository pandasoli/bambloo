<script lang='ts'>
	import type { MouseEventHandler } from 'svelte/elements'

	export let enabled: boolean = false
	export let onchange: ((checked: boolean) => void)|undefined = undefined

	const onclick: MouseEventHandler<HTMLButtonElement> = () => {
		enabled = !enabled
		onchange?.(enabled)
	}
</script>

<button class:enabled={enabled} on:click={onclick}>
	<div />
</button>

<style lang='scss'>
	$width: 38px;
	$padding: 3px;

	button {
		position: relative;
		display: flex;
		width: $width;
		height: 18px;
		padding: $padding;
		border-radius: 8px;
		background: var(--light-bg);

		&.enabled { background: var(--blue) }
		&.enabled div { background: white; right: $padding }
	}

	div {
		position: absolute;
		width: 12px;
		height: 12px;
		right: calc($width - $padding - 12px);
		border-radius: 50%;
		background: var(--header-text-cl);
		transition: 250ms right
	}
</style>
