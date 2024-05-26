#!/usr/bin/python
import lib.hyprland as Hypr
import sys

if __name__ == "__main__":
    active = Hypr.active_window()
    if active["pinned"]:
        Hypr.Dispatcher.pin()
        Hypr.Dispatcher.toggle_floating()
    else:
        Hypr.Dispatcher.fake_fullscreen()
        Hypr.Dispatcher.toggle_floating()
        Hypr.Dispatcher.resize_active(Hypr.ResizeParams(35, 35, True, True, True))
        Hypr.Dispatcher.move_active(Hypr.ResizeParams(64, 3, True, True, True))
        Hypr.Dispatcher.pin()