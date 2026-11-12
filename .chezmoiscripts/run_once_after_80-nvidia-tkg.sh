#!/usr/bin/env bash
# run_once_after_80-nvidia-tkg — Frogging-Family nvidia-all bootstrap.
# nvidia-all is deliberately interactive (driver branch/module-type prompts)
# and not in AUR or any repo, so it can't live in a package slice. This script
# detects NVIDIA hardware, fetches the PKGBUILD repo, and offers the build
# when a controlling terminal exists.
set -euo pipefail

command -v lspci >/dev/null || { echo "lspci missing — skip nvidia detect"; exit 0; }
lspci -nn | grep -iE 'vga|3d|display' | grep -qi 'nvidia' || exit 0   # no nvidia gpu

if pacman -Qq nvidia-utils-tkg >/dev/null 2>&1; then
    echo "nvidia-utils-tkg already installed — nothing to do"
    exit 0
fi

SRC="$HOME/.local/src/nvidia-all"
mkdir -p "${SRC%/*}"
if [[ -d $SRC/.git ]]; then
    git -C "$SRC" pull --ff-only || true
else
    git clone https://github.com/Frogging-Family/nvidia-all "$SRC"
fi

if pacman -Qq nvidia-utils nvidia-open nvidia-dkms >/dev/null 2>&1; then
    echo "repo nvidia driver present — remove it before installing -tkg" >&2
fi

echo "nvidia GPU detected. nvidia-all repo at $SRC"
echo "driver build is interactive (branch/module type) — run: cd $SRC && makepkg -si"

if { : <>/dev/tty; } 2>/dev/null; then
    printf 'build nvidia-all now? [y/N] ' >/dev/tty
    read -r ans </dev/tty || ans=n
    [[ ${ans,,} == y* ]] && (cd "$SRC" && makepkg -si </dev/tty) || true
fi
