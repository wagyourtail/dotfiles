#!/usr/bin/python
import subprocess
import json
import time

if __name__ == "__main__":
    # get active window
    active = subprocess.run(["hyprctl", "activewindow", "-j"], capture_output=True).stdout.decode("utf-8")
    active = json.loads(active)
    subprocess.run(["hyprctl", "dispatch", "killactive"])
    if active["fullscreen"]:    
        for i in range(10):
            subprocess.run(["hyprctl", "dispatch", "workspace", "r-1"])