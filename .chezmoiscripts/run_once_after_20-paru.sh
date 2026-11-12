#!/usr/bin/env bash
# run_once_after_20-paru: make sure paru exists (AUR helper for all package ops).
set -euo pipefail

command -v pacman >/dev/null || exit 0
command -v paru >/dev/null && exit 0

SUDO=""; (( EUID != 0 )) && SUDO=sudo

# Preferred: binary package from chaotic-aur (run_once_before_10 enables it).
if grep -q '^\[chaotic-aur\]' /etc/pacman.conf; then
    $SUDO pacman -S --needed --noconfirm paru && exit 0
fi

# Fallback: build paru-bin from the AUR.
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git clone https://aur.archlinux.org/paru-bin.git "$tmp/paru-bin"
(cd "$tmp/paru-bin" && makepkg -si --noconfirm)
