import type { Manifest } from '@/models/Manifest.ts'


export interface Presence extends Manifest {
	active: boolean
}
