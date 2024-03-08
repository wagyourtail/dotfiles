#!/bin/bash

echo "source \"\$HOME/dotfiles/scripts/after_rc.sh\"" >> "$HOME/.zshrc"
guake --restore-preferences "$HOME/dotfiles/other/guake.conf"

ln -s "$HOME/dotfiles/.config/hypr/hyprland.conf" "$HOME/.config/hypr/hyprland.conf"
ln -s "$HOME/dotfiles/.config/hypr/hyprlock.conf" "$HOME/.config/hypr/hyprlock.conf"
ln -s "$HOME/dotfiles/.config/hypr/hypridle.conf" "$HOME/.config/hypr/hypridle.conf"
ln -s "$HOME/dotfiles/.config/dunst/dunstrc" "$HOME/.config/dunst/dunstrc"
ln -s "$HOME/dotfiles/.config/wofi/style.css" "$HOME/.config/wofi/style.css"
ln -s "$HOME/dotfiles/.config/waybar/config" "$HOME/.config/waybar/config"
ln -s "$HOME/dotfiles/.config/waybar/style.css" "$HOME/.config/waybar/style.css"
