
export enum ConnState {
	Stopped,
	Connecting,
	WaitingDetails,
	Connected
}

export enum ConnMethod {
	NativeMessaging,
	WebSocket
}

export interface ConnDetails { multiple: boolean }

export interface WebSocketArgs { port: number }

interface ConnBase {
	method: ConnMethod
	state: ConnState
	errMsg?: string
	details: ConnDetails
}

export interface NativeMessagingConn extends ConnBase {
	method: ConnMethod.NativeMessaging
	port: chrome.runtime.Port
}

export interface WebSocketConn extends ConnBase {
	method: ConnMethod.WebSocket
	socket: WebSocket
	args: WebSocketArgs
}

export type ConnArgs = WebSocketArgs
export type Conn = NativeMessagingConn | WebSocketConn
