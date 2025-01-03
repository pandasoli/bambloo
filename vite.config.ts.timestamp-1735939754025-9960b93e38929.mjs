// vite.config.ts
import { defineConfig } from "file:///home/panda/Dev/bambloo/crx.js/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///home/panda/Dev/bambloo/crx.js/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { crx } from "file:///home/panda/Dev/bambloo/crx.js/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// public/manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "Bambloo",
  description: "Let your Discord friends knwo what's in your browser",
  minimum_chrome_version: "120",
  version: "1.0.0",
  action: {
    default_title: "Share what you are up to on Discord",
    default_popup: "index.html",
    default_icon: {
      "16": "logo/icon-16.png",
      "32": "logo/icon-32.png",
      "48": "logo/icon-48.png",
      "128": "logo/icon-128.png"
    }
  },
  icons: {
    "16": "logo/icon-16.png",
    "32": "logo/icon-32.png",
    "48": "logo/icon-48.png",
    "128": "logo/icon-128.png"
  },
  permissions: ["nativeMessaging", "storage", "tabs", "userScripts", "scripting"],
  host_permissions: ["<all_urls>"],
  background: {
    service_worker: "src/background.ts",
    type: "module"
  }
};

// vite.config.ts
import tsconfigPaths from "file:///home/panda/Dev/bambloo/crx.js/node_modules/vite-tsconfig-paths/dist/index.mjs";
import sveltePreprocess from "file:///home/panda/Dev/bambloo/crx.js/node_modules/svelte-preprocess/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess()
    }),
    tsconfigPaths(),
    crx({ manifest: manifest_default })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicHVibGljL21hbmlmZXN0Lmpzb24iXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wYW5kYS9EZXYvYmFtYmxvby9jcnguanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3BhbmRhL0Rldi9iYW1ibG9vL2NyeC5qcy92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wYW5kYS9EZXYvYmFtYmxvby9jcnguanMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSAnQHN2ZWx0ZWpzL3ZpdGUtcGx1Z2luLXN2ZWx0ZSdcbmltcG9ydCB7IE1hbmlmZXN0VjNFeHBvcnQsIGNyeCB9IGZyb20gJ0Bjcnhqcy92aXRlLXBsdWdpbidcbmltcG9ydCBtYW5pZmVzdCBmcm9tICcuL3B1YmxpYy9tYW5pZmVzdC5qc29uJ1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocydcbmltcG9ydCBzdmVsdGVQcmVwcm9jZXNzIGZyb20gJ3N2ZWx0ZS1wcmVwcm9jZXNzJ1xuXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG5cdFx0c3ZlbHRlKHtcblx0XHRcdHByZXByb2Nlc3M6IHN2ZWx0ZVByZXByb2Nlc3MoKVxuXHRcdH0pLFxuXHRcdHRzY29uZmlnUGF0aHMoKSxcblx0XHRjcngoeyBtYW5pZmVzdDogbWFuaWZlc3QgYXMgTWFuaWZlc3RWM0V4cG9ydCB9KVxuXHRdXG59KVxuIiwgIntcblx0XCJtYW5pZmVzdF92ZXJzaW9uXCI6IDMsXG5cdFwibmFtZVwiOiBcIkJhbWJsb29cIixcblx0XCJkZXNjcmlwdGlvblwiOiBcIkxldCB5b3VyIERpc2NvcmQgZnJpZW5kcyBrbndvIHdoYXQncyBpbiB5b3VyIGJyb3dzZXJcIixcblx0XCJtaW5pbXVtX2Nocm9tZV92ZXJzaW9uXCI6IFwiMTIwXCIsXG5cdFwidmVyc2lvblwiOiBcIjEuMC4wXCIsXG5cblx0XCJhY3Rpb25cIjoge1xuXHRcdFwiZGVmYXVsdF90aXRsZVwiOiBcIlNoYXJlIHdoYXQgeW91IGFyZSB1cCB0byBvbiBEaXNjb3JkXCIsXG5cdFx0XCJkZWZhdWx0X3BvcHVwXCI6IFwiaW5kZXguaHRtbFwiLFxuXHRcdFwiZGVmYXVsdF9pY29uXCI6IHtcblx0XHRcdFwiMTZcIjogXCJsb2dvL2ljb24tMTYucG5nXCIsXG5cdFx0XHRcIjMyXCI6IFwibG9nby9pY29uLTMyLnBuZ1wiLFxuXHRcdFx0XCI0OFwiOiBcImxvZ28vaWNvbi00OC5wbmdcIixcblx0XHRcdFwiMTI4XCI6IFwibG9nby9pY29uLTEyOC5wbmdcIlxuXHRcdH1cblx0fSxcblxuXHRcImljb25zXCI6IHtcblx0XHRcIjE2XCI6IFwibG9nby9pY29uLTE2LnBuZ1wiLFxuXHRcdFwiMzJcIjogXCJsb2dvL2ljb24tMzIucG5nXCIsXG5cdFx0XCI0OFwiOiBcImxvZ28vaWNvbi00OC5wbmdcIixcblx0XHRcIjEyOFwiOiBcImxvZ28vaWNvbi0xMjgucG5nXCJcblx0fSxcblxuXHRcInBlcm1pc3Npb25zXCI6IFtcIm5hdGl2ZU1lc3NhZ2luZ1wiLCBcInN0b3JhZ2VcIiwgXCJ0YWJzXCIsIFwidXNlclNjcmlwdHNcIiwgXCJzY3JpcHRpbmdcIl0sXG5cdFwiaG9zdF9wZXJtaXNzaW9uc1wiOiBbXCI8YWxsX3VybHM+XCJdLFxuXG5cdFwiYmFja2dyb3VuZFwiOiB7XG5cdFx0XCJzZXJ2aWNlX3dvcmtlclwiOiBcInNyYy9iYWNrZ3JvdW5kLnRzXCIsXG5cdFx0XCJ0eXBlXCI6IFwibW9kdWxlXCJcblx0fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0USxTQUFTLG9CQUFvQjtBQUN6UyxTQUFTLGNBQWM7QUFDdkIsU0FBMkIsV0FBVzs7O0FDRnRDO0FBQUEsRUFDQyxrQkFBb0I7QUFBQSxFQUNwQixNQUFRO0FBQUEsRUFDUixhQUFlO0FBQUEsRUFDZix3QkFBMEI7QUFBQSxFQUMxQixTQUFXO0FBQUEsRUFFWCxRQUFVO0FBQUEsSUFDVCxlQUFpQjtBQUFBLElBQ2pCLGVBQWlCO0FBQUEsSUFDakIsY0FBZ0I7QUFBQSxNQUNmLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxJQUNSO0FBQUEsRUFDRDtBQUFBLEVBRUEsT0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1I7QUFBQSxFQUVBLGFBQWUsQ0FBQyxtQkFBbUIsV0FBVyxRQUFRLGVBQWUsV0FBVztBQUFBLEVBQ2hGLGtCQUFvQixDQUFDLFlBQVk7QUFBQSxFQUVqQyxZQUFjO0FBQUEsSUFDYixnQkFBa0I7QUFBQSxJQUNsQixNQUFRO0FBQUEsRUFDVDtBQUNEOzs7QUQ1QkEsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxzQkFBc0I7QUFJN0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBLE1BQ04sWUFBWSxpQkFBaUI7QUFBQSxJQUM5QixDQUFDO0FBQUEsSUFDRCxjQUFjO0FBQUEsSUFDZCxJQUFJLEVBQUUsVUFBVSxpQkFBNkIsQ0FBQztBQUFBLEVBQy9DO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
