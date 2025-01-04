<script lang='ts'>
	import ConnChooser from '@/components/ConnChooser.svelte'

	import treeIcon from '@/assets/trees/welcome.png'
</script>

<img src={treeIcon} id='tree' />
<img src='/logo/icon-700.png' id='logo' />

<main>
	<h1>Welcome!</h1>
	<ConnChooser />
</main>

<style lang='less'>
	h1 {
		color: white;
		margin-bottom: 120px;
		font-weight: 400;
		font-size: 28px
	}

	#tree {
		position: absolute;
		width: 238px;
		top: 0;
		right: 0;
		mix-blend-mode: lighten
	}

	#logo {
		position: absolute;
		height: 100px;
		width: 131px;
		right: -35px;
		bottom: 0;
		object-fit: cover;
		z-index: 99
	}
</style>
