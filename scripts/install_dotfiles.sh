#!/bin/bash

echo "source \"\$HOME/dotfiles/scripts/after_rc.sh\"" >> "$HOME/.zshrc"
guake --restore-preferences "$HOME/dotfiles/other/guake.conf"

mkdir -p "$HOME/.config/hypr/"
mv "$HOME/.config/hypr/hyprland.conf" "$HOME/.config/hypr/hyprland.conf.bak"
ln -s "$HOME/dotfiles/.config/hypr/hyprland.conf" "$HOME/.config/hypr/hyprland.conf"
mv "$HOME/.config/hypr/hyprlock.conf" "$HOME/.config/hypr/hyprlock.conf.bak"
ln -s "$HOME/dotfiles/.config/hypr/hyprlock.conf" "$HOME/.config/hypr/hyprlock.conf"
mv "$HOME/.config/hypr/hypridle.conf" "$HOME/.config/hypr/hypridle.conf.bak"
ln -s "$HOME/dotfiles/.config/hypr/hypridle.conf" "$HOME/.config/hypr/hypridle.conf"
mv "$HOME/.config/hypr/pyprland.toml" "$HOME/.config/hypr/pyprland.toml.bak"
ln -s "$HOME/dotfiles/.config/hypr/pyprland.toml" "$HOME/.config/hypr/pyprland.toml"

mkdir -p "$HOME/.config/dunst/"
mv "$HOME/.config/dunst/dunstrc" "$HOME/.config/dunst/dunstrc.bak"
ln -s "$HOME/dotfiles/.config/dunst/dunstrc" "$HOME/.config/dunst/dunstrc"

mkdir -p "$HOME/.config/wofi/"
mv "$HOME/.config/wofi/style.css" "$HOME/.config/wofi/style.css.bak"
ln -s "$HOME/dotfiles/.config/wofi/style.css" "$HOME/.config/wofi/style.css"

mkdir -p "$HOME/.config/waybar/"
mv "$HOME/.config/waybar/config" "$HOME/.config/waybar/config.bak"
ln -s "$HOME/dotfiles/.config/waybar/config" "$HOME/.config/waybar/config"
mv "$HOME/.config/waybar/style.css" "$HOME/.config/waybar/style.css.bak"
ln -s "$HOME/dotfiles/.config/waybar/style.css" "$HOME/.config/waybar/style.css"

mv "$HOME/.config/electron-flags.conf" "$HOME/.config/electron-flags.conf.bak"
ln -s "$HOME/dotfiles/.config/electron-flags.conf" "$HOME/.config/electron-flags.conf"
mv "$HOME/.config/vesktop-flags.conf" "$HOME/.config/vesktop-flags.conf.bak"
ln -s "$HOME/dotfiles/.config/vesktop-flags.conf" "$HOME/.config/vesktop-flags.conf"

mkdir -p "$HOME/.config/anyrun/"
mv "$HOME/.config/anyrun/config.ron" "$HOME/.config/anyrun/config.ron.bak"
ln -s "$HOME/dotfiles/.config/anyrun/config.ron" "$HOME/.config/anyrun/config.ron"
mv "$HOME/.config/anyrun/shell.ron" "$HOME/.config/anyrun/shell.ron.bak"
ln -s "$HOME/dotfiles/.config/anyrun/shell.ron" "$HOME/.config/anyrun/shell.ron"

mkdir -p "$HOME/.config/xdg-desktop-portal/"
mv "$HOME/.config/xdg-desktop-portal/hyprland-portals.conf" "$HOME/.config/xdg-desktop-portal/hyprland-portals.conf.bak"
ln -s "$HOME/dotfiles/.config/xdg-desktop-portal/hyprland-portals.conf" "$HOME/.config/xdg-desktop-portal/hyprland-portals.conf"

mkdir -p "/home/william/.config/vesktop/settings"
mv "$HOME/.config/vesktop/settings/settings.json" "$HOME/.config/vesktop/settings/settings.json.bak"
ln -s "$HOME/dotfiles/.config/vesktop/settings/settings.json" "$HOME/.config/vesktop/settings/settings.json"

mv "$HOME/.config/ags" "$HOME/.config/ags.bak"
ln -s "$HOME/dotfiles/.config/ags" "$HOME/.config/ags"
ln -s "/usr/share/com.github.Aylur.ags/types" "$HOME/dotfiles/.config/ags/types"