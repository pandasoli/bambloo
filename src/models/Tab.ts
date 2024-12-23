
export interface Tab extends chrome.tabs.Tab {
	presence_id?: number
	enabled: boolean
}
