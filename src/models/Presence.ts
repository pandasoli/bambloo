import type { Manifest } from '@/models/Manifest.ts'


export interface Presence extends Manifest {
	id: number
	enabled: boolean
	input?: string
}
