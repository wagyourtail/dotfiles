#!/usr/bin/python
import lib.hyprland as Hypr
import sys

# hyprctl dispatch movetoworkspace empty
# hyprctl dispatch fullscreen $1

if __name__ == "__main__":
    argv = sys.argv[1:]
    # hyprctl activewindow -j
    active = Hypr.active_window()

    mode = len(argv) and int(argv[0]) or 0

    activeFullscreen = active["fullscreen"]
    activeMode = active["fullscreenMode"]

    # if fullscreen, make not fullscreen and move to first workspace on montor
    if activeFullscreen:
        Hypr.Dispatcher.fullscreen(activeMode)
        if mode == activeMode:
            for i in range(10):
                Hypr.Dispatcher.move_to_workspace("r-1")
        else:
            Hypr.Dispatcher.fullscreen(mode)
    else:
        while Hypr.workspaces()[active["workspace"]["id"] - 1]["windows"] > 1:
            Hypr.Dispatcher.move_to_workspace("r+1")
        Hypr.Dispatcher.fullscreen(mode)