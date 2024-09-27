
const ConnMethodsList = ['native-messaging', 'ws'] as const
export type ConnMethod = typeof ConnMethodsList[number]

export interface BaseConn {
	method: ConnMethod
	connected: boolean
	errMsg: string|null
	args: unknown
}

export interface WSArgs { port: number }

export interface NativeMessagingConn extends BaseConn {
	method: 'native-messaging'
	port: chrome.runtime.Port
}

export interface WSConn extends BaseConn {
	method: 'ws'
	socket: WebSocket
	args: WSArgs
}

export type Conn = NativeMessagingConn | WSConn
export type ConnArgs = WSArgs

export const isConnMethod = (val: string): val is ConnMethod =>
	ConnMethodsList.includes(val as ConnMethod)
