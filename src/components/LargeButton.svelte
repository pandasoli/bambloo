<script lang='ts'>
	import type { MouseEventHandler } from 'svelte/elements'

	export let src: string|undefined = undefined
	export let alt: string|undefined = undefined
	export let href: string|undefined = undefined
	export let onclick: MouseEventHandler<HTMLButtonElement>|undefined = undefined
</script>

{#if href}
	<a {href} { ...$$restProps }>
		<img {src} {alt} />
		<slot />
	</a>
{:else}
	<button on:click={onclick} { ...$$restProps }>
		<img {src} {alt} />
		<slot />
	</button>
{/if}

<style lang='less'>
	button, a {
		display: flex;
		align-items: center;
		gap: 4px;
		height: auto;
		border-radius: 6px;
		padding: 2px 8px;
		background: var(--blue);
		color: white;
		text-decoration: none;
		cursor: pointer;
		transition: 250ms opacity;

		&:hover { opacity: .8 }
		img { width: 24px; height: 24px; object-fit: contain }
	}
</style>
