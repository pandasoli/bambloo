import type { Manifest } from '@/models/Manifest.ts'


export interface Presence extends Manifest {
	id: number
	repo: string
	path: string
	enabled: boolean
	input?: string
}
