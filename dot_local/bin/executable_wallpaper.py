#!/usr/bin/python

import json
import os
import random
import sys
import vdf
import subprocess
from pathlib import Path

# find the wallpaper engine config file from steam.
wallpaper_engine_app_id = 431960

steam_content_paths = [
    ".steam/steam/steamapps",
    ".local/share/Steam/steamapps",
    ".var/app/com.valvesoftware.Steam/.local/share/Steam/steamapps",
    "snap/steam/common/.local/share/Steam/steamapps"
]

def find_library_folders():
    home = os.environ['HOME']
    for path in steam_content_paths:
        if os.path.exists(f"{home}/{path}/"):
            config_path = f"{home}/{path}/"
            break
    
    if not config_path:
        return None
    
    with open(f"{config_path}libraryfolders.vdf", "r") as f:
        library_folders = vdf.load(f)
    
    return [value["path"] for value in library_folders["libraryfolders"].values()]


def find_wallpaper_engine_config(library_folders):
    for folder in library_folders:
        appmanifest_path = f"{folder}/steamapps/appmanifest_{wallpaper_engine_app_id}.acf"
        if os.path.exists(appmanifest_path):
            break
    
    if not os.path.exists(appmanifest_path):
        return None
    
    with open(appmanifest_path, "r") as f:
        appmanifest = vdf.load(f)
    
    installdir = appmanifest["AppState"]["installdir"]
    return f"{folder}/steamapps/common/{installdir}/config.json"

def get_roots():
    monitors = subprocess.run(["wlr-randr", "--json"], capture_output=True).stdout.decode("utf-8")
    monitors = json.loads(monitors)
    return sum([["--screen-root", monitor["name"]] for monitor in monitors], [])

def get_playlist(config_path):
    with open(config_path, "r") as f:
        config = json.load(f)
    lastSelectedMonitor = config["steamuser"]["general"]["browser"]["lastselectedmonitor"]
    playlists = config["steamuser"]["general"]["wallpaperconfig"]["selectedwallpapers"]

    if lastSelectedMonitor not in playlists:
        return None, None
    
    mon = playlists[lastSelectedMonitor]

    if "playlist" not in mon:
        return None, None

    items = mon["playlist"]["items"]
    switch_time = mon["playlist"]["settings"]["delay"] * 60
    return items, switch_time


def render_wallpaper(wallpaper, timeout, quiet):
    roots = get_roots()
    args = [
        "linux-wallpaperengine", 
        *roots,
        "--fps=25",
        "--silent",
        "--scaling=fit",
        "--clamping=border",
        wallpaper
    ]
    if quiet:
        monitorProcess = subprocess.Popen(
            args,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    else:
        monitorProcess = subprocess.Popen(
            args
        )
    try:
        monitorProcess.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        pass
    finally:
        monitorProcess.kill()
    return


# select random from playlist for monitor
if __name__ == "__main__":
    args = sys.argv[1:]
    if (len(args)):
        DEBUG_WALLPAPER = args[0][args[0].rfind("=")+1:] # url or path, path must not contain = obv...
    else:
        DEBUG_WALLPAPER = False
    
    print("locating library folders")
    library_folders = find_library_folders()
    if library_folders is None:
        print("No library folders found.")
        sys.exit(1)

    print("locating wallpaper engine config")
    config_path = find_wallpaper_engine_config(library_folders)
    if config_path is None:
        print("No wallpaper engine config found.")
        sys.exit(1)

    while True:
        items, switch_time = get_playlist(config_path)

        if DEBUG_WALLPAPER:
            if DEBUG_WALLPAPER.startswith("Z:"):
                selected = DEBUG_WALLPAPER
            else:
                selected = "  " + DEBUG_WALLPAPER
            # get path to wallpaper
            wallpaper_path = selected[2:]
        else:
            print("selecting random wallpaper")
            selected = random.choice(items)
            # get path to wallpaper
            wallpaper_path = str(Path(selected[2:]).parent)

        render_wallpaper(wallpaper_path, switch_time, not DEBUG_WALLPAPER)
