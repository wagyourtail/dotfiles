#!/bin/bash

echo "source \"\$HOME/dotfiles/scripts/after_rc.sh\"" >> "$HOME/.zshrc"
guake --restore-preferences "$HOME/dotfiles/other/guake.conf"

mv "$HOME/.config/hypr/hyprland.conf" "$HOME/.config/hypr/hyprland.conf.bak"
ln -s "$HOME/dotfiles/.config/hypr/hyprland.conf" "$HOME/.config/hypr/hyprland.conf"
mv "$HOME/.config/hypr/hyprlock.conf" "$HOME/.config/hypr/hyprlock.conf.bak"
ln -s "$HOME/dotfiles/.config/hypr/hyprlock.conf" "$HOME/.config/hypr/hyprlock.conf"
mv "$HOME/.config/hypr/hypridle.conf" "$HOME/.config/hypr/hypridle.conf.bak"
ln -s "$HOME/dotfiles/.config/hypr/hypridle.conf" "$HOME/.config/hypr/hypridle.conf"
mv "$HOME/.config/dunst/dunstrc" "$HOME/.config/dunst/dunstrc.bak"
ln -s "$HOME/dotfiles/.config/dunst/dunstrc" "$HOME/.config/dunst/dunstrc"
mv "$HOME/.config/wofi/style.css" "$HOME/.config/wofi/style.css.bak"
ln -s "$HOME/dotfiles/.config/wofi/style.css" "$HOME/.config/wofi/style.css"
mv "$HOME/.config/waybar/config" "$HOME/.config/waybar/config.bak"
ln -s "$HOME/dotfiles/.config/waybar/config" "$HOME/.config/waybar/config"
mv "$HOME/.config/waybar/style.css" "$HOME/.config/waybar/style.css.bak"
ln -s "$HOME/dotfiles/.config/waybar/style.css" "$HOME/.config/waybar/style.css"
