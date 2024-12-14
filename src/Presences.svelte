<script lang='ts'>
	import { presences, problem } from '@/stores/presences.ts'
	import { ui } from '@/stores/ui.ts'

	import type { Presence } from '@/models/Presence.ts'

	import CheckBox from '@/components/CheckBox.svelte'

	import SettingsScreen from '@/Settings.svelte'

	import treeIcon from '@/assets/trees/presences.png'


	const toggle = (presence: Presence) =>
		presences.toggle_enabled(presence)
</script>

{#if $presences !== null}
	<img src={treeIcon} id='tree' />
{/if}

<main class:error={$presences === null}>
	{#if $presences}
		{#each $presences as presence, i}
			<div class='presence'>
				<img src={presence.images.icon} />
				<span>{presence.title}</span>
				<CheckBox checked={presence.enabled} onchange={() => toggle(presence)} />
			</div>

			{#if i < $presences.length - 1} <hr /> {/if}
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

<button id='settings' class:active={$ui.config_open} on:click={ui.toggleConfigOpen}>
	<svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M17.6705 7.52126L15.3579 7.14326C15.2225 6.67917 15.0374 6.23309 14.8058 5.81087L16.1558 3.88683C16.265 3.73148 16.2462 3.51978 16.112 3.38517L14.5902 1.86417C14.4544 1.72878 14.2407 1.71117 14.085 1.82348L12.1899 3.18561C11.7638 2.95004 11.3138 2.763 10.847 2.62722L10.4435 0.324C10.4107 0.136957 10.2483 0 10.0581 0H7.90591C7.71417 0 7.55061 0.138913 7.5197 0.328304L7.14561 2.619C6.67604 2.754 6.22526 2.93909 5.8007 3.17152L3.9107 1.82152C3.75457 1.71 3.54209 1.728 3.4063 1.863L1.8853 3.384C1.75109 3.51822 1.7323 3.72952 1.84148 3.88487L3.17152 5.78778C2.93478 6.21626 2.74617 6.66978 2.60883 7.1417L0.32713 7.52165C0.138522 7.55296 0 7.71652 0 7.90748V10.0597C0 10.2494 0.136174 10.4118 0.322826 10.4451L2.60452 10.8497C2.74109 11.3204 2.9297 11.774 3.16722 12.2036L1.82074 14.087C1.70961 14.2423 1.72722 14.4556 1.86222 14.5913L3.38361 16.1139C3.51783 16.2481 3.72952 16.2669 3.88487 16.1577L5.79052 14.823C6.21822 15.0582 6.67018 15.2448 7.13857 15.3802L7.52048 17.6737C7.55139 17.8619 7.71457 18 7.90591 18H10.0581C10.2479 18 10.4103 17.8638 10.4431 17.6772L10.852 15.3724C11.3212 15.2343 11.7708 15.0464 12.1942 14.8109L14.1136 16.1573C14.2693 16.2673 14.4806 16.2481 14.6152 16.1139L16.1366 14.5913C16.272 14.4556 16.2896 14.2415 16.1773 14.0858L14.8085 12.1852C15.0406 11.7626 15.2249 11.3157 15.3591 10.8517L17.6748 10.4451C17.8623 10.4122 17.9984 10.2494 17.9984 10.0597V7.90748C17.9988 7.71574 17.8599 7.55217 17.6705 7.52126ZM8.99922 11.7391C7.48644 11.7391 6.26009 10.5128 6.26009 9C6.26009 7.48722 7.48644 6.26087 8.99922 6.26087C10.512 6.26087 11.7383 7.48722 11.7383 9C11.7383 10.5128 10.512 11.7391 8.99922 11.7391Z' fill='#576175'/>
	</svg>
</button>

{#if $ui.config_open}
	<SettingsScreen close={ui.toggleConfigOpen}/>
{/if}

<style lang='scss'>
	#tree {
		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
		width: 214px;
		mix-blend-mode: lighten;
		image-rendering: pixelated
	}

	#settings {
		position: absolute;
		right: 8px;
		bottom: 8px;
		height: 18px;
		padding: 0;
		background: none;
		cursor: pointer;
		transition: 250ms opacity, 250ms transform;

		&:hover { opacity: .75 }

		&.active { transform: rotate(20deg) }
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

		span {
			margin-top: 2px;
			color: white;
			flex: 1
		}
	}
</style>
