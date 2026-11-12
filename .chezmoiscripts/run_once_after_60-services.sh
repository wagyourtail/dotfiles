#!/usr/bin/env bash
# run_once_after_60-services — enable the handful of units the slices' packages
# provide but don't auto-enable. Idempotent; safe to re-run manually.
set -euo pipefail

SUDO=""; (( EUID != 0 )) && SUDO=sudo

# paccache.timer prunes the pacman cache weekly (keeps last 3 pkg versions);
# reflector.timer refreshes the mirrorlist weekly — both ship disabled.
for unit in paccache.timer reflector.timer; do
    $SUDO systemctl enable --now "$unit" 2>/dev/null \
        && echo "enabled $unit" || echo "skip $unit (not installed?)"
done

# services that should run when their package is installed (docker + ollama
# were enabled on warch-desktop; sshd stays a manual choice)
for unit in docker.service ollama.service; do
    $SUDO systemctl enable --now "$unit" 2>/dev/null \
        && echo "enabled $unit" || echo "skip $unit (not installed?)"
done

# user-level units deployed into ~/.config/systemd/user
systemctl --user daemon-reload 2>/dev/null || true
systemctl --user enable --now mem-watch.timer 2>/dev/null \
    && echo "enabled mem-watch.timer (user)" || true
