<script lang='ts'>
	import type { FocusEventHandler } from 'svelte/elements'

	import ConnChooser from '@/components/ConnChooser.svelte'
	import LargeButton from '@/components/LargeButton.svelte'
	import ToolTip from '@/components/ToolTip.svelte'

	import { repos } from '@/stores/repos'

	import discordIcon from '@/assets/discord.svg'
	import githubIcon from '@/assets/github.svg'


	export let close: () => void


	let repos_text = $repos.join('\n')


	const update_repos: FocusEventHandler<HTMLTextAreaElement> = () =>
		repos.set(
			repos_text
				.split('\n')
				.map(e => e.trim())
		)
</script>

<main>
	<img src='/logo/icon-700.png' id='logo' />

	<header>
		<button on:click={close}>
			<svg width='20' height='10' viewBox='0 0 20 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
				<path d='M2.70467 2.35658C1.53988 3.59579 0.592255 4.6973 0.592255 4.83499C0.592255 5.20872 4.75786 9.55579 5.13296 9.55579C5.5278 9.55579 5.92265 9.18206 5.92265 8.78866C5.92265 8.61163 5.33038 7.82483 4.61966 7.0577L3.33642 5.62179L11.1741 5.58245C18.38 5.52344 19.0315 5.50377 19.2289 5.16938C19.3868 4.93334 19.3868 4.73664 19.2289 4.48094C19.0315 4.16622 18.38 4.14655 11.1741 4.08754L3.33642 4.0482L4.61966 2.61229C5.92265 1.17638 6.12007 0.782982 5.68574 0.350243C5.19219 -0.141506 4.73812 0.173213 2.70467 2.35658Z' fill='#5765F2'/>
			</svg>
		</button>
	</header>

	<div>
		<span class='header'>Connection Method</span>
		<ConnChooser />

		<br />

		<span class='header'>Repositories</span>
		<textarea
			id='repos'
			placeholder='Presence repos separated by line'
			bind:value={repos_text}
			on:focusout={update_repos}
		></textarea>

		<br />
		<br />

		<span class='center header'>Credits</span>

		<p>
			<span class='info'>Bambloo</span> was designed and developed by
			<ToolTip href='https://github.com/pandasoli'>
				<a href='https://github.com/pandasoli'>Eli Soli</a>
			</ToolTip>
			and is now public and free to all to help and enjoy.
		</p>

		<div id='socials'>
			<ToolTip href='https://discord.gg/4gNjyuXgMG'>
				<LargeButton src={discordIcon} alt='Discord icon' href='https://discord.gg/4gNjyuXgMG'>
					Discord Server
				</LargeButton>
			</ToolTip>

			<ToolTip href='https://github.com/pandasoli/bambloo'>
				<LargeButton src={githubIcon} alt='GitHub icon' href='https://github.com/pandasoli/bambloo'>
					GitHub Repository
				</LargeButton>
			</ToolTip>
		</div>
	</div>
</main>

<style lang='scss'>
	main {
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
		overflow-y: auto
	}

	#logo {
		position: fixed;
		height: 100px;
		width: 131px;
		right: -35px;
		bottom: 0;
		object-fit: cover;
		z-index: 99
	}

	header {
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

	main > div {
		width: 228px;
		padding: 8px;
		padding-bottom: 100px
	}

	#repos { width: 100% }

	#socials {
		display: flex;
		gap: 4px
	}
</style>
