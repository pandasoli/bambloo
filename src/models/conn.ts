
const ConnMethodsList = ['browser', 'ws', 'native-messaging'] as const
export type ConnMethod = typeof ConnMethodsList[number]

export interface BaseConn {
	method: ConnMethod
	connected: boolean
	errMsg: string|null
}

export interface BrowserConn extends BaseConn {
	method: 'browser'
	ctx: chrome.runtime.ExtensionContext|null
}

export interface WSConn extends BaseConn {
	method: 'ws'
	socket: WebSocket
}

export interface NativeMessagingConn extends BaseConn {
	method: 'native-messaging'
	port: chrome.runtime.Port
}

export type Conn = BrowserConn | WSConn | NativeMessagingConn | null

export const isConnMethod = (val: string): val is ConnMethod =>
	ConnMethodsList.includes(val as ConnMethod)
