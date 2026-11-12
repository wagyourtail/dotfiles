#!/bin/bash

sleep 5
hyprctl dispatch "hl.dsp.exec_cmd('steam -nochatui -nofriendsui -silent')"
hyprctl dispatch "hl.dsp.exec_cmd('vesktop')"
hyprctl dispatch "hl.dsp.exec_cmd('wallpaper.py')"

# Set Primary display for xwayland applications (fixes cs2)
xrandr --output $PRIMARY_DISPLAY --primary
