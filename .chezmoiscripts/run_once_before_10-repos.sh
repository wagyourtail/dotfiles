#!/usr/bin/env bash
# run_once_before_10-repos: enable multilib + chaotic-aur before packages install.
set -euo pipefail

command -v pacman >/dev/null || { echo "not an Arch system — skipping repos"; exit 0; }

SUDO=""; (( EUID != 0 )) && SUDO=sudo

# multilib (needed for steam/lib32-*/wine)
if ! grep -q '^\[multilib\]' /etc/pacman.conf; then
    echo "enabling multilib"
    $SUDO sed -i '/^#\[multilib\]/,/^#Include/ s/^#//' /etc/pacman.conf
fi

# chaotic-aur (prebuilt AUR binaries)
if ! grep -q '^\[chaotic-aur\]' /etc/pacman.conf; then
    echo "enabling chaotic-aur"
    # lsign needs a local key — fresh containers/ISOs have an uninit'd keyring
    $SUDO pacman-key --list-secret-keys 2>/dev/null | grep -q '^sec' || $SUDO pacman-key --init
    $SUDO pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
    $SUDO pacman-key --lsign-key 3056513887B78AEB
    $SUDO pacman -U --needed --noconfirm \
        'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' \
        'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
    printf '\n[chaotic-aur]\nInclude = /etc/pacman.d/chaotic-mirrorlist\n' | $SUDO tee -a /etc/pacman.conf
fi

$SUDO pacman -Sy
