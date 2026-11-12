#!/usr/bin/python
import lib.hyprland as Hypr
import subprocess

if __name__ == "__main__":
    # get active window
    active = Hypr.active_window()
    Hypr.Dispatcher.kill_active()
    if active["fullscreen"]:
        Hypr.Dispatcher.workspace("r~1")