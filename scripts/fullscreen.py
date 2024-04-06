#!/usr/bin/python
import subprocess
import json
import sys

# hyprctl dispatch movetoworkspace empty
# hyprctl dispatch fullscreen $1

if __name__ == "__main__":
    argv = sys.argv[1:]
    # hyprctl activewindow -j
    active = subprocess.run(["hyprctl", "activewindow", "-j"], capture_output=True).stdout.decode("utf-8")
    active = json.loads(active)

    mode = len(argv) and int(argv[0]) or 0

    activeFullscreen = active["fullscreen"]
    activeMode = active["fullscreenMode"]

    # if fullscreen, make not fullscreen and move to first workspace on montor
    if activeFullscreen:
        subprocess.run(["hyprctl", "dispatch", "fullscreen", str(mode)])
        if mode == activeMode:
            for i in range(10):
                subprocess.run(["hyprctl", "dispatch", "movetoworkspace", "r-1"])
        else:
            subprocess.run(["hyprctl", "dispatch", "fullscreen", str(mode)])
    else:
        subprocess.run(["hyprctl", "dispatch", "movetoworkspace", "empty"])
        subprocess.run(["hyprctl", "dispatch", "fullscreen", str(mode)])