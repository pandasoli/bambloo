<script lang='ts'>
	import { presences, problem } from '@/stores/presences.ts'
	import CheckBox from '@/components/CheckBox.svelte'
</script>

{#if $presences !== null}
	<img src='/trees/presences.png' id='tree' />
{/if}

<main class:error={$presences === null}>
	{#if $presences}
		{#each $presences as presence, i}
			<div class='presence'>
				<img src={presence.images.icon} />
				<span>{presence.title}</span>
				<CheckBox checked={presence.active} />
			</div>

			{#if i < $presences.length - 1}
				<hr />
			{/if}
		{/each}
	{:else}
		<div class='err-panel'>
			<span class='error'>Could not parse local JSON data</span>

			<div class='buttons'>
				<button class='red outline'>Delete my data</button>
				<button class='red'>Retry parsing</button>
			</div>
		</div>

		<code>{$problem}</code>
	{/if}
</main>

<style lang='scss'>
	#tree {
		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
		width: 214px;
		mix-blend-mode: lighten
	}

	main { padding-top: 16px }

	main.error {
		display: flex;
		flex-direction: column;
		justify-content: end;
		gap: 12px;
		height: 100%
	}

	.err-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;

		.buttons {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 6px;

			button {
				font-size: 9pt;
				height: 18px;
				width: 107px
			}
		}
	}

	.presence {
		display: flex;
		gap: 10px;
		padding: 3px 6px;

		img {
			width: 30px;
			height: 30px;
			border-radius: 6px
		}

		span { margin-top: 2px; flex: 1 }
	}
</style>
