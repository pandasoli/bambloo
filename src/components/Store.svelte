<script lang='ts'>
	import { onMount } from 'svelte'
	import { repos } from '@/stores/repos.ts'
	import { presences } from '@/stores/presences.ts'
	import type { Manifest } from '@/models/Manifest.ts'

	// Used for "..." animation
	const loadingMsgs = Array.from({ length: 4 }, (_, i) => 'Loading presences' + '.'.repeat(i))
	let loadingMsgsIndex = 0

	type Location = { repo: string, path: string }

	let repo_i = 0

	let manifests_path: Location[] = []
	let manifests: Manifest[] = []
	let error: string|null = null

	const load_presences = async () => {
		while (manifests_path.length > 0) {
			const { repo, path } = manifests_path[0]

			const url = `https://raw.githubusercontent.com/${repo}/refs/heads/master/`
			const res = await fetch(url + path)

			// Check HTTP status code
			if (res.status !== 200) {
				error = `Request to file <span class='code'>${path}</span> inside repo <span class='code>${repo}</span> returned status code <span class='code'>${res.status}</span>`
				return null
			}

			// Process response
			const manifest: Manifest = await res.json()
			const pwd = url + path.split('/').slice(0, -1).join('/') + '/'

			if (manifest.images.background.startsWith('.')) manifest.images.background = pwd + manifest.images.background
			if (manifest.images.icon.startsWith('.')) manifest.images.icon = pwd + manifest.images.icon

			manifests = [ ...manifests, manifest ]
			manifests_path.shift()
		}
	}

	const load_repos = async () => {
		for (; repo_i < $repos.length; ++repo_i) {
			const repo = $repos[repo_i]
			const res = await fetch(`https://api.github.com/repos/${repo}/git/trees/master?recursive=1`)

			// Check HTTP status code
			if (res.status !== 200) {
				error = `Request to repo <span class='code'>${repo}</span> returned status code <span class='code'>${res.status}</span>`
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

		load_presences()
	}

	const retry = () => {
		error = null

		/* Identify where the error comes from
		 * based on what it didn't finish
		 * processing
		 */

		if (repo_i < $repos.length) load_repos()
		else load_presences()
	}

	const manage = (manifest: Manifest) => null

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
			<button class='red outline' on:click={retry}>Retry</button>
		</div>
	{:else if manifests.length === 0}
		<div id='loading'>
			<span class='info'>{loadingMsgs[loadingMsgsIndex]}</span>
		</div>
	{:else}
		<div id='searchbox'>
			<input type='text' placeholder='Search here...' />

			<div>
				<svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path d='M3.98827 0C1.78336 0 0 1.74248 0 3.89685C0 6.05122 1.78336 7.7937 3.98827 7.7937C4.77548 7.7937 5.50403 7.56805 6.1217 7.18481L9.00293 10L10 9.02579L7.15543 6.25358C7.66679 5.59814 7.97654 4.786 7.97654 3.89685C7.97654 1.74248 6.19318 0 3.98827 0ZM3.98827 0.916905C5.67724 0.916905 7.03812 2.2466 7.03812 3.89685C7.03812 5.5471 5.67724 6.87679 3.98827 6.87679C2.2993 6.87679 0.938416 5.5471 0.938416 3.89685C0.938416 2.2466 2.2993 0.916905 3.98827 0.916905Z' fill='white'/>
				</svg>
			</div>
		</div>

		<div id='presences' class:loading={manifests.length === 0}>
			{#each manifests as manifest}
				<div class='presence'>
					<img src={manifest.images.background} class='bg' />

					<div>
						<img src={manifest.images.icon} class='icon' />
						<span class='title'>{manifest.title}</span>

						<button on:click={() => manage(manifest)}>
							{#if $presences?.find(e => e.title === manifest.title)}
											<img src='/svgs/trash.svg' alt='Trash icon' />
							{:else} <img src='/svgs/download.svg' alt='Download icon' />
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</main>

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

		button {
			font-size: 9pt;
			height: 18px;
			width: 80px
		}
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
			background: none;
			padding-right: 10px;
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
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 38px;

		input {
			width: 70%;
			height: 20px;
			border-radius: 10px;
			background: var(--light-bg);
			border: none;
			padding: 3px 9px;
			font-size: 8pt;
			outline: none;

			&::placeholder { color: var(--header-text-cl) }
		}

		div {
			position: absolute;
			display: grid;
			place-items: center;
			top: 16px;
			left: 193px;
			width: 20px;
			height: 20px;
			background: var(--blue);
			border-radius: 50%
		}
	}
</style>
