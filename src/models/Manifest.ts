
export interface Manifest {
	title: string
	description: string
	author: string

	title_color: string

	images: {
		background: string
		icon: string
	},

	previews: string[]
	urls: string[]

	script: string

	__meta__: {
		repo: string
		/* Working directory of the manifest in
		 * the repository. Ex:
		 *     src/search-engines/duckduckgo
		 *     src/streamings/youtube
		 */
		path: string
	}
}
