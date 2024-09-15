
chrome.runtime.onMessage.addListener(msg => {
	if (msg.type !== 'offscreen') return
	chrome.runtime.sendMessage({ type: 'background', data: msg.data + ' back' })
	return false
})

chrome.runtime.sendMessage({ type: 'background', data: 'hi' })
