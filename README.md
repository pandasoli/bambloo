
<div align=center>

# Bambloo :blueberries::panda_face:
> A Chrome extension that creates a Discord activity just as you want  
> [Discord Server](https://discord.gg/4gNjyuXgMG)

</div>
<br>
<br>
<br>

> [!WARNING]
> Under development!

> [!WARNING]
> If your debugging, don't worry about the error `Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.`
> it happens because we're trying to send a message to the popup when it's not open (at `src/utils/update_global.ts`).

<br>
<br>
<br>

You have a presence store to download "presence makers".
> Scritps that make an activity object as the extension expects.

<br>

You'll be able to switch between different ways of connecting to Discord
- WebDiscord (`discord.com/app`) that uses the same technique as [chrome-discord-presence][gh:chrome-discord-presence]
- LocalDiscord (Locally installed Discord client) uses the same technique as [ytdp][gh:ytdp]


Notes
---

The way [chrome-discord-presence][gh:chrome-discord-presence] gets the token doesn't work anymore,
use [this](https://howtogeek.com/879956/what-is-a-discord-token-and-how-do-you-get-one) instead.
- Log in using discord.com/app
- Open the Dev Tools
- Go to `Network` tab
- Filter for `/api`
- Select `country-code`
- In the `Request Headers` section look for `Authorization`


Resouces
---

- [Chrome extension tutorial](https://developer.chrome.com/docs/extensions/get-started)
- [Firefox extension tutorial](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtension)


[gh:chrome-discord-presence]: https://github.com/seia-soto/chrome-discord-presence
[gh:ytdp]: https://github.com/XFG16/YouTubeDiscordPresence
[gh:premid]: https://github.com/PreMiD

