
export interface Manifest {
	title: string
	description: string
	author: string

	images: {
		background: string
		icon: string
	},

	previews: string[]
	urls: string[]

	script: string
}
