
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
}
