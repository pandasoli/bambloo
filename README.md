<div align=center>

# Bambloo 🫐🐼
> Show your Discord friends what you're up to right now ✨
</div>
<br>
<br>

<img align=right src='https://github.com/user-attachments/assets/dc3d8e81-5c8d-4949-9816-51202a3a7f73' />

[**Bambloo**](https://github.com/pandasoli/bambloo) is a super easy web extension that lets you share
what you're up to in your browser with your friends on Discord.
It is straightforward, <ins>configurable</ins> and <samp>pretty</samp> 🫐

<br>

- Straightforward
- Simple
- User friendly
- Non hidden complexity
- Configurable

<br>
<br>
<div align=center>

![Number of issues](https://img.shields.io/github/issues/pandasoli/bambloo?color=fab387&labelColor=303446&style=for-the-badge)
![Number of stars](https://img.shields.io/github/stars/pandasoli/bambloo?color=ed8796&labelColor=303446&style=for-the-badge)
[![MIT license](https://img.shields.io/github/license/pandasoli/bambloo?style=for-the-badge&label=License&labelColor=313244&color=ca9ee6)](LICENSE)

![Supports linux](https://img.shields.io/badge/Linux-support-fcc624?logoColor=fcc624&labelColor=303446)
![Supports Chrome 120+](https://img.shields.io/badge/Chrome-120%2B-C1E1C1?labelColor=313244)
</div>

> [!WARNING]
> We are just starting, so there might not be many websites supports and bugs might occur.  
> If any bug occur please create an issue and we'll reply as soon as possible to fix it.

<div align=center>

[Installing the Extension](#installing-the-extension-) |
[Installing the Host](#installing-the-host-) |
[How It Works](#how-it-works-)
</div>

<br>
<br>

## Installing the Extension 🫐

While the extension is not available on the Chrome Store you can install it manually.

In the [Releases tab](https://github.com/pandasoli/bambloo/releases) you'll find the versions with their changelog and files.  
Under the `Assets` drop-down are the files, you can choose whether you prefer  
a zip file or a tarball. Download the one with the name "bambloo-extension".

If you prefer, you can build yourself by cloning this repo and running `bin run build`.

<br>

After downloading extract the file and follow the next steps accordingly to your browser:

<details>
	<summary>Google Chrome</summary>
<br>

Inside your browser, type `chrome://extensions` in your searchbar or,  
click on the 3-dot button in the upper right corner, hover over the  
"Extensions" option and click on "Manage Extensions".

In the upper right corner enable `Developer mode`, after that  
click on the "Load unpacked" button in the upper left corner and  
search for and select the folder you extracted.
</details>

<br>
<br>

## Installing the Host 🐼

The extension alone is not enough, it needs a way to talk to Discord.  
The way we found is having a program (a host) running on your system next to Discord.

We have a variety of hosts, you can choose the one you feel most comfortable with.  
Hosts differ by connection method, but don't worry about that unless you're a developer,  
and programming language, you might prefer a Python host, or maybe a binary one?

<br>

**Connection methods:**

- [Native Messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging)

	Ideal if you work with web development or networks and need all possible ports available.

- WebSocket

  > ✨ Recommended for **Bambloo** debugging

 	The difference from a Native Messaging host is that you'll have to run this host  
  on your terminal whenever you want to use **Bambloo**.

<br>

That being said let's install a host!  
In the [Releases tab](https://github.com/pandasoli/bambloo/releases) you'll also find files named "\<method\>-hosts".  
Download it and extract, if it is a WebSocket host you can already run it, otherwise read this:

<br>

### How to install Native Messaging hosts

There is probably a shell file called `install.sh` in the extracted folder,  
you can run it passing the args `--browser=<name> lang=<name>` and it will be installed.

<br>

> [!IMPORTANT]
> Update `"path"` inside `com.elisoli.bambloo.host.json` to your host's path and  
> the first `"allowed_origins"` value to the extension ID that's in your  
> browser's "Manage extensions" page.

<br>

If your browser is not supported by this file you can install it manually:
- (if needed) Compile the host you chose
- Find your browser's config path, it's usually under `~/.config`
- Look for a folder called "NativeMessagingHosts"
- Copy the file `com.elisoli.bambloo.host.json` to this folder

<br>
<br>

## How it works ✨
> If you are a developer please refer to the [Developer Docs](DEVELOPER.md) for a more detailed explanation.

The extension's service worker manages all the data and events of the extension,  
when you install a Presence through the Store tab you are getting a manifest file  
from the repositories you have configured (default: https://github.com/pandasoli/bambloo-repo),  
and this manifest file contains the path inside the repository where lies a script,  
which that run on the tab it was made to run and collects information about the page,  
which later is sent to the service worker, then to the host and then to Discord.
