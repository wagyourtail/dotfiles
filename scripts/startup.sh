#!/bin/bash

sleep 5
hyprctl dispatch exec "steam -nochatui -nofriendsui -silent"
hyprctl dispatch exec vesktop
hyprctl dispatch exec "$HOME/dotfiles/scripts/wallpaper.py"

# Set Primary display for xwayland applications (fixes cs2)
xrandr --output DP-3 --primary
