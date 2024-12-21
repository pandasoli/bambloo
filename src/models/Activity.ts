
interface ActivityTimestamps {
	start?: number
	end?: number
}

interface ActivityAssets {
	large_image?: string
	large_text?:  string
	small_image?: string
	small_text?:  string
}

interface ActivityButton {
	label: string
	url:   string
}

export interface Activity {
	state?:      string
	details?:    string
	timestamps?: ActivityTimestamps
	assets?:     ActivityAssets
	buttons?:    ActivityButton[]
}
