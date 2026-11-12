#!/usr/bin/env bash
# run_once_after_70-snapper — set up snapper root snapshots on btrfs systems.
# Idempotent: skips creation when a 'root' config already exists, but always
# re-asserts the timers. Deliberately creates NO config for /home — home is
# excluded from snapshots by choice (churn vs. real config lives in dotfiles).
set -euo pipefail

SUDO=""; (( EUID != 0 )) && SUDO=sudo

command -v snapper >/dev/null || { echo "snapper not installed — skipping"; exit 0; }
findmnt -n -o FSTYPE / | grep -qx btrfs || { echo "/ not btrfs — skipping"; exit 0; }

if $SUDO snapper list-configs | grep -q "^root\b"; then
    echo "snapper: root config exists"
else
    # /.snapshots must be free for snapper to create its own subvolume —
    # archinstall btrfs layouts often ship it as a mounted @.snapshots subvol.
    if mountpoint -q /.snapshots; then $SUDO umount /.snapshots; fi
    [[ -d /.snapshots ]] && $SUDO rmdir /.snapshots 2>/dev/null || true
    $SUDO snapper -c root create-config /
    echo "snapper: created root config"
fi

# timeline = periodic snapshots; cleanup = retention pruning. snap-pac adds
# pre/post transaction pairs on top once snapper exists.
$SUDO systemctl enable --now snapper-timeline.timer snapper-cleanup.timer
echo "snapper: timers enabled"
