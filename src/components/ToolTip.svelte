<script lang='ts'>
	import { onMount } from 'svelte'


	export let text: string|undefined = undefined
	export let href: string|undefined = undefined


	let self: HTMLDivElement
	let base: HTMLElement

	onMount(() => {
		self.style.right = '0'
		const container_w = self.getBoundingClientRect().right
		const w = self.getBoundingClientRect().width
		self.style.right = 'unset'

		const base_left = base.getBoundingClientRect().left
		const base_bottom = base.getBoundingClientRect().bottom
		const base_w = base.getBoundingClientRect().width

		const base_center = base_left + base_w / 2
		const padding_inline = 10, padding_block = 4
		let left = 0, top = base_bottom + padding_block

		if (container_w - base_center >= w / 2)
			left = base_center - w / 2
		else
			left = container_w - w - padding_inline

		if (left < 10) left = 10

		self.style.left = `${left}px`
		self.style.top = `${top}px`
	})
</script>

<span bind:this={base}>
	<slot />
</span>

<div bind:this={self}>
	<p>
		{#if href} <a {href}>{href}</a>
		{:else} {text}
		{/if}
	</p>
</div>

<style lang='less'>
	span:hover + div {
		visibility: visible;
		opacity: 1
	}

	div {
		position: absolute;
		padding: 6px;
		background: var(--light-bg);
		border-radius: 4px;
		box-shadow: 1px 2px 4px 2px rgba(0, 0, 0, .2);

		visibility: hidden;
		opacity: 0;
		transition: 250ms opacity;

		p {
			margin: 0;
			color: var(--text-cl);
			font-size: 9pt
		}
	}
</style>
