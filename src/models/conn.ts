
const ConnMethodsList = ['browser', 'native-messaging', 'ws'] as const
export type ConnMethod = typeof ConnMethodsList[number]

export interface BaseConn {
	method: ConnMethod
	connected: boolean
	errMsg: string|null
}

export interface BrowserArgs { authentication_token: string }
export interface WSArgs { port: number }

export interface BrowserConn extends BaseConn {
	method: 'browser'
	ctx: chrome.runtime.ExtensionContext|null
	args: BrowserArgs
}

export interface NativeMessagingConn extends BaseConn {
	method: 'native-messaging'
	port: chrome.runtime.Port
}

export interface WSConn extends BaseConn {
	method: 'ws'
	socket: WebSocket
	args: WSArgs
}

export type Conn = BrowserConn | NativeMessagingConn | WSConn | null
export type ConnArgs = BrowserArgs | WSArgs | null

export const isConnMethod = (val: string): val is ConnMethod =>
	ConnMethodsList.includes(val as ConnMethod)
