#!/bin/sh

manifest_name='com.elisoli.bambloo.discord.json'

op='install'
lang='python'
browser='chrome'
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
		'firefox')
			manifest=$(echo "$manifest" | sed "/allowed_origins/d") ;;
		*)
			manifest=$(echo "$manifest" | sed "/allowed_extensions/d") ;;
	esac
}

get_browser_path() {
	XDG_CONFIG_HOME=${XDG_CONFIG_HOME:-"$HOME/.config"}
	case "$browser" in
		'chrome_unstable') echo "$XDG_CONFIG_HOME/google-chrome-unstable/NativeMessagingHosts" ;;
		'chrome') echo "$XDG_CONFIG_HOME/google-chrome/NativeMessagingHosts" ;;
		'brave') echo "$XDG_CONFIG_HOME/BraveSoftware/Brave-Browser/NativeMessagingHosts" ;;
		'vivaldi') echo "$XDG_CONFIG_HOME/vivaldi/NativeMessagingHosts" ;;
		'firefox') echo "$HOME/.mozilla/native-messaging-hosts" ;;
	esac
}

# Check browser info
manifest=$(< "$manifest_name")
browser_path=$(get_browser_path)

if [ -z "$browser_path" ]; then
	echo "Browser not supported"
	exit 1
fi

check_browser_info

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
