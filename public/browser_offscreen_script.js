import './discord.js'


const connect = auth_token => new Promise(resolve => {
	// NOTE: update user-agent value forcely to connect Discord API via browser;
	Discord.Constants.UserAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.309 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36'

	const client = new Discord.Client({ transport: 'websocket' /* NOTE: On webbrowser environment */ })

	client.on('debug', console.log)

	client.once('ready', () =>
		client.user.setActivity('Chrome', { type: 'PLAYING' })
	)

	client.login(auth_token)
		.then(() => resolve({ client, err: null }))
		.catch(e => resolve({ client, err: String(e) }))
})

chrome.runtime.onMessage.addListener((msg, _, send) => {
	if (msg.type !== 'offscreen') return

	connect(msg.args.auth_token)
		.then(({ err }) => send(err || 'OK'))

	return true
})
