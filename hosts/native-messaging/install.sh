#!/bin/sh

manifest_name='./com.elisoli.bambloo.discord.json'

op='install'
lang='python'
browser='chrome_stable'
id=''
dist="$HOME/.local/share/bambloo"
entry='natmsg-bambloo'

# Parse flags
while [ $# -gt 0 ]; do
	flag=$1
	shift

	case "$flag" in
		uninstall)
			op='uninstall'
			;;

		--lang|--browser|--dist|--id)
			if [ $# -eq 0 ]; then
				echo "Expected value after \`$flag\`"
				exit 1
			fi

			eval "${flag#--}=\$1"
			shift
			;;

		*)
			echo "Unknown flag \`$flag\`"
			exit 1
			;;
	esac
done

# Define global variables
check_browser_info() {
	if [ -z "$id" ]; then
		echo "Missing extension ID"
		exit 1
	fi

	manifest=$(echo "$manifest" | sed "s|\$ID|$id|g")

	case "$browser" in
		'firefox_bin')
			manifest=$(echo "$manifest" | sed "/allowed_origins/d") ;;
		*)
			manifest=$(echo "$manifest" | sed "/allowed_extensions/d") ;;
	esac
}

get_browser_path() {
	case "$browser" in
		'chrome_unstable') echo "$XDG_CONFIG_HOME/google-chrome-unstable/NativeMessagingHosts" ;;
		'chrome_stable') echo "$XDG_CONFIG_HOME/google-chrome/NativeMessagingHosts" ;;
		'vivaldi') echo "$XDG_CONFIG_HOME/vivaldi/NativeMessagingHosts" ;;
		'firefox_bin') echo "$HOME/.mozilla/native-messaging-hosts" ;;
	esac
}

is_supported_browser() {
	case "$browser" in
		'chrome_stable' | 'chrome_unstable' | 'vivaldi' | 'firefox_bin') return 0 ;;
		*) return 1 ;;
	esac
}

# Check if the browser is supported
if ! is_supported_browser; then
	echo "Browser not supported"
	exit 1
fi

# Check browser info
manifest=$(< "$manifest_name")
check_browser_info
browser_path=$(get_browser_path)

# Perform operation (install/uninstall)
if [ "$op" = 'uninstall' ]; then
	rm -r "$dist"
	rm "$browser_path/$manifest_name"
else
	ext=''

	if [ "$lang" = 'python' ]; then
		ext='py'
	else
		echo "Unknown lang"
		exit 1
	fi

	manifest=$(echo "$manifest" | sed "s|\$PATH|$dist/$lang/$entry.$ext|g")

	mkdir -p "$dist"
	cp -r $lang "$dist"

	echo "$manifest" > "$browser_path/$manifest_name"
fi
