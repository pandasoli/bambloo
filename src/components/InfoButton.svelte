<main>
	<div>
		<p><slot /></p>
	</div>

	<span>?</span>
</main>

<style lang='less'>
	main {
		position: relative;

		&:hover div {
			opacity: 1;
			visibility: visible
		}
	}

	span {
		--cl: var(--bg);

		display: flex;
		align-self: center;
		justify-content: center;
		width: 15px;
		height: 15px;
		font-size: 9px;
		font-weight: bold;
		color: var(--cl);
		border: 1px solid var(--cl);
		border-radius: 50%;
		transition: 250ms color;

		&:hover { --cl: var(--blue) }
	}

	div {
		position: absolute;
		width: 180px;
		bottom: 10px;
		right: 10px;
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
