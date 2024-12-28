<script lang='ts'>
	import { onMount } from 'svelte'

	import StorePresence from '@/StorePresence.svelte'
	import Button from '@/components/Button.svelte'

	import { repos } from '@/stores/repos.ts'
	import { presences } from '@/stores/presences.ts'
	import { ui } from '@/stores/ui.ts'

	import type { Manifest } from '@/models/Manifest.ts'
	import { AppTab } from '@/models/AppTab.ts'

	import downloadIcon from '@/assets/download.svg'
	import trashIcon from '@/assets/trash.svg'


	type Location = { repo: string, path: string }
	type Item = { repo: string, path: string } & Manifest


	// Used for "..." animation
	const loadingMsgs = Array.from({ length: 4 }, (_, i) => 'Loading presences' + '.'.repeat(i))
	let loadingMsgsIndex = 0

	let repo_i = 0

	let manifests_path: Location[] = []
	let items: Item[] = []
	let error: string|null = null

	const load_presences = async (amount: number) => {
		for (let i = 0; manifests_path.length > 0 && i < amount; ++i && manifests_path.shift())
		{
			const { repo, path } = manifests_path[0]

			const url = `https://raw.githubusercontent.com/${repo}/refs/heads/master/`
			const res = await fetch(url + path)

			// Check HTTP status code
			if (res.status !== 200) {
				error = `Request to file <span class='error code'>${path}</span> inside repo <span class='error code'>${repo}</span> returned status code <span class='error code'>${res.status}</span>`
				return null
			}

			// Process response
			const item: Item = await res.json()
			const dir = path.split('/').slice(0, -1).join('/')

			if (item.images.background.startsWith('.')) item.images.background = `${url}/${dir}/${item.images.background}`
			if (item.images.icon.startsWith('.')) item.images.icon = `${url}/${dir}/${item.images.icon}`

			item.script = `${url}/${dir}/${item.script}`
			item.repo = repo
			item.path = dir

			items = [ ...items, item ]
		}
	}

	const load_repos = async () => {
		const more_amount = 10

		if (manifests_path.length < more_amount) {
			const expected_len = items.length + 10

			for (; repo_i < $repos.length && items.length < expected_len; ++repo_i) {
				const repo = $repos[repo_i]
				const res = await fetch(`https://api.github.com/repos/${repo}/git/trees/master?recursive=1`)

				// Check HTTP status code
				if (res.status !== 200) {
					error = `Request to repo <span class='error code'>${repo}</span> returned status code <span class='error code'>${res.status}</span>`
					return null
				}

				// Process response
				const msg = await res.json()

				const locations = msg.tree
					.filter(({ type }: { type: string }) => type === 'blob')
					.filter(({ path }: { path: string }) => path.endsWith('manifest.json'))
					.map(({ path }: { path: string }) => ({ repo, path }))

				manifests_path = [ ...manifests_path, ...locations ]
			}
		}

		load_presences(more_amount)
	}

	const retry = () => {
		error = null

		/* Identify where the error comes from
		 * based on what it didn't finish
		 * processing
		 */

		if (repo_i < $repos.length) load_repos()
		else load_presences(1)
	}

	const manage = (e: MouseEvent, item: Item) => {
		e.stopPropagation()

		if ($presences) {
			const found = $presences.find(e => e.title === item.title)

			if (found) presences.remove(item)
			else presences.append(item, item.repo, item.path)
		}
	}

	const openPresence = (item: Item) => {
		ui.setOpenedPresence(item)
		ui.setTab(AppTab.Store)
	}

	onMount(() => {
		load_repos()

		const interval = setInterval(() =>
			loadingMsgsIndex = (loadingMsgsIndex + 1) % loadingMsgs.length
		, 500)

		return () => clearInterval(interval)
	})
</script>

<main>
	{#if error}
		<div id='error'>
			<span class='error'>{@html error}</span>

			<div>
				<Button type='red' outline on:click={retry}>Retry</Button>
			</div>
		</div>
	{:else if items.length === 0}
		<div id='loading'>
			<span class='info'>{loadingMsgs[loadingMsgsIndex]}</span>
		</div>
	{:else}
		<div id='searchbox'>
			<div>
				<input type='text' disabled placeholder='Search here...' />

				<div>
					<svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
						<path d='M3.98827 0C1.78336 0 0 1.74248 0 3.89685C0 6.05122 1.78336 7.7937 3.98827 7.7937C4.77548 7.7937 5.50403 7.56805 6.1217 7.18481L9.00293 10L10 9.02579L7.15543 6.25358C7.66679 5.59814 7.97654 4.786 7.97654 3.89685C7.97654 1.74248 6.19318 0 3.98827 0ZM3.98827 0.916905C5.67724 0.916905 7.03812 2.2466 7.03812 3.89685C7.03812 5.5471 5.67724 6.87679 3.98827 6.87679C2.2993 6.87679 0.938416 5.5471 0.938416 3.89685C0.938416 2.2466 2.2993 0.916905 3.98827 0.916905Z' fill='white'/>
					</svg>
				</div>
			</div>
		</div>

		<div id='presences' class:loading={items.length === 0}>
			{#each items as item}
				<button class='presence' on:click={() => openPresence(item)}>
					<img src={item.images.background} class='bg' />

					<div>
						<img src={item.images.icon} class='icon' />
						<span class='title' style='color: {item.title_color}'>{item.title}</span>

						<button on:click={e => manage(e, item)}>
							{#if $presences?.find(e => e.title === item.title)}
											<img src={trashIcon} alt='Trash icon' />
							{:else} <img src={downloadIcon} alt='Download icon' />
							{/if}
						</button>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</main>

{#if $ui.opened_presence}
	<StorePresence item={$ui.opened_presence} close={() => ui.setOpenedPresence(null)} />
{/if}

<style lang='scss'>
	main {
		display: flex;
		flex-direction: column;
		gap: 14px;
		height: 100%
	}

	#presences {
		display: flex;
		flex-direction: column;
		gap: 2px
	}

	#loading {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;

		span { font-weight: bold }
	}

	#error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 4px;
		height: 100%;

		div { width: 100px }
	}

	.presence {
		position: relative;
		display: flex;
		height: 50px;
		width: 228px;

		& > div {
			box-sizing: border-box;
			display: flex;
			gap: 10px;
			width: 100%;
			height: 100%;
			padding: 6px 4px;
			z-index: 1
		}

		button {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			width: 38px;
			cursor: pointer;

			&:hover { opacity: .75 }
		}
	}

	.title {
		text-align: left;
		flex: 1;
		cursor: pointer;
		height: fit-content
	}

	.icon, .bg { image-rendering: pixelated }

	.icon {
		width: 30px;
		height: 30px;
		border-radius: 6px;
		cursor: pointer
	}

	.bg {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 8px
	}

	#searchbox {
		display: grid;
		place-items: center;
		height: 38px;

		* { cursor: not-allowed !important }

		& > div {
			position: relative;
			width: 70%;
			height: 20px;

			input {
				border-radius: 10px;
				background: var(--light-bg);
				border: none;
				padding: 6px 10px;
				font-size: 8pt;
				outline: none
			}

			div {
				position: absolute;
				display: grid;
				place-items: center;
				width: 20px;
				height: 20px;
				bottom: -7px;
				right: -7px;
				background: var(--blue);
				border-radius: 50%;
				cursor: pointer
			}
		}
	}
</style>
