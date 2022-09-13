#/bin/bash

rsync -avu --delete "bing.gator@ristepan.gmail.com/" "/home/ristepan/.local/share/gnome-shell/extensions/bing.gator@ristepan.gmail.com"

dbus-run-session -- gnome-shell --nested