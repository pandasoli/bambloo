<script lang='ts'>
	import type { FocusEventHandler } from 'svelte/elements'

	import ToolTip from '@/components/ToolTip.svelte'

	import type { Manifest } from '@/models/Manifest.ts'

	import { presences } from '@/stores/presences.ts'

	import storePresenceTreeIcon from '@/assets/trees/store_presence.png'
	import downloadIcon from '@/assets/download.svg'
	import trashIcon from '@/assets/trash.svg'
	import linkIcon from '@/assets/link.svg'
	import gitIcon from '@/assets/git.svg'


	export let item: Manifest
	export let close: () => void


	const presence = $presences?.find(e => e.title === item.title)
	const installed = presence !== undefined
	let input = presence?.input ?? ''

	const manage = (item: Manifest) => {
		if ($presences) {
			const found = $presences.find(e => e.title === item.title)

			if (found) chrome.runtime.sendMessage({ type: 'presence remove', manifest: item })
			else presences.append(item)
		}
	}

	const change_input: FocusEventHandler<HTMLTextAreaElement> = () => {
		if (installed)
			presences.change_input(presence, input)
	}
</script>

<main id='container'>
	<img src={storePresenceTreeIcon} id='tree' />

	<header>
		<button on:click={close}>
			<svg width='20' height='10' viewBox='0 0 20 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
				<path d='M2.70467 2.35658C1.53988 3.59579 0.592255 4.6973 0.592255 4.83499C0.592255 5.20872 4.75786 9.55579 5.13296 9.55579C5.5278 9.55579 5.92265 9.18206 5.92265 8.78866C5.92265 8.61163 5.33038 7.82483 4.61966 7.0577L3.33642 5.62179L11.1741 5.58245C18.38 5.52344 19.0315 5.50377 19.2289 5.16938C19.3868 4.93334 19.3868 4.73664 19.2289 4.48094C19.0315 4.16622 18.38 4.14655 11.1741 4.08754L3.33642 4.0482L4.61966 2.61229C5.92265 1.17638 6.12007 0.782982 5.68574 0.350243C5.19219 -0.141506 4.73812 0.173213 2.70467 2.35658Z' fill='#5765F2'/>
			</svg>
		</button>
	</header>

	<div>
		<img src={item.images.background} id='bg' />

		<header>
			<img src={item.images.icon} id='icon' />

			<div>
				<h1 id='title'>{item.title}</h1>
				<span id='author' class='blue'>{item.author}</span>
			</div>

			<button on:click={() => manage(item)}>
				{#if $presences?.find(e => e.title === item.title)}
								<img src={trashIcon} alt='Trash icon' />
				{:else} <img src={downloadIcon} alt='Download icon' />
				{/if}
			</button>
		</header>

		<main>
			<div id='previews'>
				{#each item.previews as src}
					<img {src} />
				{/each}
			</div>

			<p id='description'>{item.description}</p>

			<div id='details'>
				<div>
					<img src={gitIcon} alt='Git icon' />
					<p>{item.__meta__.repo}</p>
				</div>

				<div id='urls'>
					<img src={linkIcon} alt='Link icon' />

					<p>{item.urls.join('\n')}</p>
				</div>
			</div>

			{#if installed}
				<footer>
					<span class='center header'>Installed</span>

					<textarea
						placeholder='Data to be sent to this Presence Script...'
						bind:value={input}
						on:focusout={change_input}
					></textarea>

					<p>
						If you have any problem using this Presence Script
						please reach us out on
						<ToolTip href='https://discord.gg/4gNjyuXgMG'>
							<a href='https://discord.gg/4gNjyuXgMG'>Discord</a>
						</ToolTip>
						or create an issue on
						<ToolTip href='https://github.com/pandasoli/bambloo'>
							<a href='https://github.com/pandasoli/bambloo'>GitHub</a>.
						</ToolTip>
					</p>
				</footer>
			{/if}
		</main>
	</div>
</main>

<style lang='less'>
	#container {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		padding: 12px;
		background: var(--bg);
		overflow-y: auto;
		z-index: 2
	}

	#tree {
		position: absolute;
		width: 224px;
		top: 0;
		right: 0;
		mix-blend-mode: lighten;
		image-rendering: pixelated
	}

	#container > header,
	#container > div { z-index: 1 }

	#container > header {
		display: flex;
		align-items: center;
		width: 248px;
		height: 30px;

		button {
			height: 30px;
			cursor: pointer;
			transition: 250ms opacity;

			&:hover { opacity: .75 }
		}
	}

	#container > div {
		width: 228px;
		padding: 8px;
		padding-bottom: 100px;

		main {
			display: flex;
			flex-direction: column;
			gap: 8px
		}
	}

	div header {
		display: flex;
		padding: 8px;
		gap: 8px;

		div { flex: 1 }

		button {
			margin-right: 10px;
			cursor: pointer;

			&:hover { opacity: .75 }
		}
	}

	div footer { padding-top: 18px }

	#bg, #icon { image-rendering: pixelated }

	#bg {
		width: 100%;
		height: 50px;
		object-fit: cover;
		border-radius: 4px 4px 0px 0px
	}

	#icon {
		width: 30px;
		height: 30px;
		border-radius: 6px
	}

	#title {
		text-align: left;
		font-size: 12px;
		font-weight: normal;
		height: fit-content;
		margin: 0;
		color: var(--text-cl)
	}

	#author {
		font-size: 9px;
		color: var(--blue)
	}

	#previews {
		display: flex;
		gap: 4px;
		height: 200px;
		overflow-x: auto;

		img { border-radius: 4px }
	}

	#description {
		font-size: 10px;
		padding-block: 8px;
		margin: 0;
		color: var(--header-text-cl)
	}

	#details {
		display: grid;
		gap: 10px;

		& > div {
			display: flex;
			align-items: center;
			gap: 10px
		}

		img { width: 18px; height: 18px }
		p { margin: 0; color: var(--header-text-cl) }

		#urls {
			display: flex;
			gap: 10px;
			padding: 8px;
			border-radius: 4px;
			background: var(--light-bg);
			overflow-x: auto;

			img { width: 18px; height: 14px }
			p { margin: 0; color: var(--header-text-cl) }
		}
	}

	footer {
		textarea {
			width: 100%;
			font-size: 12px
		}
	}
</style>
