
export const AppTabsList = ['presences', 'tabs', 'store'] as const
export type AppTab = typeof AppTabsList[number]

export const isTab = (val: string): val is AppTab =>
	AppTabsList.includes(val as AppTab)
