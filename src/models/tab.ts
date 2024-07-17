
const TabsList = ['presences', 'tabs', 'store'] as const
export type Tab = typeof TabsList[number]

export const isTab = (val: string): val is Tab =>
	TabsList.includes(val as Tab)
