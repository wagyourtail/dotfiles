#!/usr/bin/env bash
# GNOME-interface defaults the xdg-desktop-portal Settings backend reads.
# color-scheme drives libadwaita dark mode (Nautilus etc); gtk-theme keeps
# gsettings consumers consistent with ~/.config/gtk-3.0|4.0 settings.ini.
set -euo pipefail

command -v gsettings >/dev/null || exit 0
gsettings list-schemas | grep -qx org.gnome.desktop.interface || exit 0

gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
gsettings set org.gnome.desktop.interface gtk-theme 'adw-gtk3-dark'
