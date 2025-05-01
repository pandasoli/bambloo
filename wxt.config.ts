import { defineConfig } from 'wxt'
import { resolve } from 'node:path'


// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-svelte'],

	alias: {
		['@/assets']: resolve('src/assets'),
		['@/components']: resolve('src/components'),
		['@/entrypoints']: resolve('src/entrypoints'),
		['@/models']: resolve('src/models'),
		['@/services']: resolve('src/services'),
		['@/stores']: resolve('src/stores'),
		['@/utils']: resolve('src/utils')
	},

	manifest: {
		name: 'Bambloo',
		description: "Let your Discord crew know what your browser is up to!",
		minimum_chrome_version: '120',
		version: '1.0.1',

		action: {
			default_title: 'Share what you are up to on Discord',
			default_icon: {
				16: 'logo/icon-16.png',
				32: 'logo/icon-32.png',
				48: 'logo/icon-48.png',
				128: 'logo/icon-128.png'
			}
		},

		icons: {
			16: 'logo/icon-16.png',
			32: 'logo/icon-32.png',
			48: 'logo/icon-48.png',
			128: 'logo/icon-128.png'
		},

		browser_specific_settings: {
			gecko: {
				id: 'discord@bambloo.org',
				strict_min_version: '58.0'
			}
		},

		permissions: ['nativeMessaging', 'storage', 'tabs', 'userScripts', 'scripting'],
		host_permissions: ['<all_urls>']
	}
})
