#!/usr/bin/python

import json
import os
import random
import sys
import vdf
import subprocess
from pathlib import Path

if __name__ != "__main__":
    sys.exit(1)

# find the wallpaper engine config file from steam.
wallpaper_engine_app_id = 431960

steam_content_paths = [
    ".steam/steam/steamapps",
    ".local/share/Steam/steamapps",
    ".var/app/com.valvesoftware.Steam/.local/share/Steam/steamapps",
    "snap/steam/common/.local/share/Steam/steamapps"
]

home = os.environ['HOME']

for path in steam_content_paths:
    if os.path.exists(f"{home}/{path}/"):
        config_path = f"{home}/{path}/"
        break

# if the config file is not found, exit the program.
if not config_path:
    print("Steam not found.")
    sys.exit(1)

# read the library folders vdf file
with open(f"{config_path}libraryfolders.vdf", "r") as f:
    library_folders = vdf.load(f)

folders = [value["path"] for value in library_folders["libraryfolders"].values()]

# find the wallpaper engine appmanifest file
for folder in folders:
    appmanifest_path = f"{folder}/steamapps/appmanifest_{wallpaper_engine_app_id}.acf"
    if os.path.exists(appmanifest_path):
        break

if not os.path.exists(appmanifest_path):
    print("Wallpaper Engine not found.")
    sys.exit(1)

with open(appmanifest_path, "r") as f:
    appmanifest = vdf.load(f)

# open the wallpaper engine config json from path in appmanifest
installdir = appmanifest["AppState"]["installdir"]
config_path = f"{folder}/steamapps/common/{installdir}/config.json"

with open(config_path, "r") as f:
    config = json.load(f)

lastSelectedMonitor = config["steamuser"]["general"]["browser"]["lastselectedmonitor"]
playlists = config["steamuser"]["general"]["wallpaperconfig"]["selectedwallpapers"]

if lastSelectedMonitor not in playlists:
    print("No playlist found for the last selected monitor.")
    sys.exit(1)

# get monitor id's from wlr-randr
monitors = subprocess.run(["wlr-randr", "--json"], capture_output=True).stdout.decode("utf-8")
monitors = json.loads(monitors)

items = playlists[lastSelectedMonitor]["playlist"]["items"]
switch_time = playlists[lastSelectedMonitor]["playlist"]["settings"]["delay"] * 60
roots = sum([["--screen-root", monitor["name"]] for monitor in monitors], [])

# select random from playlist for monitor
while True:
    selected = random.choice(items)

    # get path to wallpaper
    wallpaper_path = str(Path(selected[2:]).parent)

    monitorProcess = subprocess.Popen(
        [
            "linux-wallpaperengine", 
            *roots,
            "--fps=25",
            "--silent",
            "--scaling=default", 
            wallpaper_path
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    try:
        monitorProcess.wait(timeout=switch_time)
    except subprocess.TimeoutExpired:
        pass
    finally:
        monitorProcess.kill()