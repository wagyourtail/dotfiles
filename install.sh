#!/bin/sh
# install.sh — one-command entrypoint for the dotfiles.
#
#   curl -L https://raw.githubusercontent.com/wagyourtail/dotfiles/BRANCH/install.sh | sh
#
# Detects context:
#   - Arch live ISO   → drives archinstall with install/archinstall-<role>.json,
#                       injects post-install commands that deploy the dotfiles.
#   - Installed Arch  → chezmoi init/apply; hands off to dots-adopt when a
#                       legacy ~/dotfiles checkout is present.
#
# Flags (all optional — missing values are prompted for):
#   --role desktop|laptop|server
#   --des "hyprland"|"cosmic"|"hyprland,cosmic"|"none"   (server → none)
#   --hostname NAME
#   --branch BRANCH   (dotfiles git branch, default master; DOTFILES_BRANCH env)
#   --config PATH|URL (override archinstall profile source)
#   --yes             assume defaults for anything still missing
#   --help
set -eu

REPO="https://github.com/wagyourtail/dotfiles"
RAW="https://raw.githubusercontent.com/wagyourtail/dotfiles"
BRANCH="${DOTFILES_BRANCH:-master}"
ROLE="" DES="" HOSTNAME="" CONFIG="" YES=0

die() { echo "install.sh: $*" >&2; exit 1; }

usage() {
    sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//'
    exit "${1:-0}"
}

while [ $# -gt 0 ]; do
    case "$1" in
        --role) ROLE="$2"; shift 2 ;;
        --des) DES="$2"; shift 2 ;;
        --hostname) HOSTNAME="$2"; shift 2 ;;
        --branch) BRANCH="$2"; shift 2 ;;
        --config) CONFIG="$2"; shift 2 ;;
        --yes) YES=1; shift ;;
        --help|-h) usage ;;
        *) die "unknown flag: $1 (--help for usage)" ;;
    esac
done

is_iso() {
    [ -d /run/archiso ] || grep -qs 'archisobasedir' /proc/cmdline
}

ask() { # ask <prompt> <default> — prints answer to stdout
    _p="$1" _d="$2" _a=""
    if [ "$YES" = 1 ]; then printf '%s' "$_d"; return; fi
    printf '%s' "$_p" >&2
    if [ -n "$_d" ]; then printf '[%s] ' "$_d" >&2; fi
    read -r _a </dev/tty || true
    printf '%s' "${_a:-$_d}"
}

pick_role() {
    [ -n "$ROLE" ] && return
    ROLE="$(ask "role (desktop/laptop/server): " "desktop")"
    case "$ROLE" in desktop|laptop|server) ;; *) die "bad role: $ROLE" ;; esac
}

pick_des() {
    if [ "$ROLE" = server ]; then DES="none"; return; fi
    [ -n "$DES" ] && return
    DES="$(ask "DEs, comma-separated (hyprland,cosmic — 'none' for headless): " "hyprland")"
}

pick_hostname() {
    [ -n "$HOSTNAME" ] && return
    HOSTNAME="$(ask "hostname: " "warch-$ROLE")"
}

# ---------- live ISO path ----------------------------------------------------
iso_install() {
    command -v archinstall >/dev/null 2>&1 || die "archinstall not found — is this the official ISO?"
    echo "==> checking connectivity"
    ping -c1 -W3 archlinux.org >/dev/null 2>&1 || \
        die "no network — connect with iwctl (wifi) or ethernet first"

    pick_role; pick_des; pick_hostname

    profile="${CONFIG:-$RAW/$BRANCH/install/archinstall-$ROLE.json}"
    cfg="/tmp/archinstall-generated.json"
    echo "==> profile: $profile"

    case "$profile" in
        http*) curl -fsSL "$profile" -o "$cfg" || die "failed to fetch $profile" ;;
        *) cp "$profile" "$cfg" || die "profile not found: $profile" ;;
    esac

    # Inject hostname + post-install commands. python3 is guaranteed on the
    # ISO (archinstall needs it); jq may not be.
    ROLE="$ROLE" DES="$DES" HOSTNAME="$HOSTNAME" BRANCH="$BRANCH" REPO="$REPO" \
    python3 - "$cfg" <<'PYEOF'
import json, os, sys
cfg = json.load(open(sys.argv[1]))
cfg["hostname"] = os.environ["HOSTNAME"]
role, des = os.environ["ROLE"], os.environ["DES"]
branch, repo = os.environ["BRANCH"], os.environ["REPO"]
cmds = cfg.setdefault("custom_commands", [])
cmds += [
    # resolve first real user (archinstall-created); fall back to root
    'U=$(awk -F: \'$3>=1000 && $3<65534 {print $1; exit}\' /etc/passwd); [ -z "$U" ] && U=root; echo "$U" > /tmp/dots_user',
    'U=$(cat /tmp/dots_user); runuser -l "$U" -c "mkdir -p ~/.config/chezmoi"',
    f'U=$(cat /tmp/dots_user); runuser -l "$U" -c \'printf "[data]\\nrole = \\"{role}\\"\\ndes = \\"{des}\\"\\n" > ~/.config/chezmoi/chezmoi.toml\'',
    f'U=$(cat /tmp/dots_user); runuser -l "$U" -c "git clone -b {branch} {repo} ~/.local/share/chezmoi 2>/dev/null || true"',
    'U=$(cat /tmp/dots_user); runuser -l "$U" -c "chezmoi apply" || true',
]
json.dump(cfg, open(sys.argv[1], "w"), indent=2)
print("post-install commands injected")
PYEOF

    echo "==> launching archinstall (disk, users, timezone are prompted)"
    archinstall --config "$cfg"

    echo
    echo "==> install finished. Reboot when ready."
    echo "    dotfiles were applied in-chroot; if that step was skipped, log in and"
    echo "    re-run this script — it detects installed systems and finishes safely."
}

# ---------- installed system path --------------------------------------------
installed_apply() {
    pick_role; pick_des

    if ! command -v chezmoi >/dev/null 2>&1; then
        echo "==> installing chezmoi"
        sudo pacman -S --needed --noconfirm chezmoi git
    fi

    # Pre-seed chezmoi data so the init template never needs a TTY.
    conf="$HOME/.config/chezmoi/chezmoi.toml"
    if [ ! -f "$conf" ]; then
        mkdir -p "$(dirname "$conf")"
        printf '[data]\nrole = "%s"\ndes = "%s"\n' "$ROLE" "$DES" >"$conf"
        echo "==> wrote $conf (role=$ROLE des=$DES)"
    fi

    src="$HOME/.local/share/chezmoi"
    if [ ! -d "$src" ]; then
        echo "==> cloning dotfiles ($BRANCH)"
        git clone -b "$BRANCH" "$REPO" "$src"
    fi
    # run init so the config-file template lands cleanly (role/des already
    # pre-seeded above, so nothing prompts)
    chezmoi init >/dev/null

    if [ -d "$HOME/dotfiles" ] && [ -f "$HOME/dotfiles/tracked.txt" ]; then
        echo "==> legacy ~/dotfiles detected — running dots-adopt"
        bash "$src/dot_local/bin/dots-adopt" --branch "$BRANCH" \
            ${ROLE:+--role "$ROLE"} ${DES:+--des "$DES"}
    else
        echo "==> applying dotfiles"
        chezmoi --source "$src" apply
    fi
}

if is_iso; then
    iso_install
else
    installed_apply
fi
