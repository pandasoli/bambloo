import type { ConnDetails } from '@/models/ConnDetails.ts'


export enum ConnMethod {
	NativeMessaging,
	WebSocket
}

export interface BaseConn {
	method: ConnMethod
	connected: boolean
	errMsg: string|null
	args: unknown
	details: ConnDetails
}

export interface WSArgs { port: number }

export interface NativeMessagingConn extends BaseConn {
	method: ConnMethod.NativeMessaging
	port: chrome.runtime.Port
}

export interface WSConn extends BaseConn {
	method: ConnMethod.WebSocket
	socket: WebSocket
	args: WSArgs
}

export type Conn = NativeMessagingConn | WSConn
export type ConnArgs = WSArgs
