#!/usr/bin/env bash
# render-check.sh — render the chezmoi source for every role×des combo and
# assert the right things are (not) deployed. Repo-only; never lands in $HOME
# (ignored via .chezmoiignore.tmpl). Used by `just templates` and CI.
#
# Needs a chezmoi binary: `CHEZMOI=/path/to/chezmoi ./scripts/render-check.sh`
set -euo pipefail
cd "$(dirname "$0")/.."

CHEZMOI="${CHEZMOI:-chezmoi}"
command -v "$CHEZMOI" >/dev/null || {
    echo "chezmoi binary not found (set CHEZMOI=/path/to/chezmoi)" >&2
    exit 1
}

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
fail=0

# managed_files <role> <des> → newline list of managed target paths
managed_files() {
    local role="$1" des="$2" conf="$tmp/conf-$1-$2" dest="$tmp/dest-$1-$2"
    mkdir -p "$conf" "$dest"
    printf '[data]\nrole = "%s"\ndes = "%s"\n' "$role" "$des" >"$conf/chezmoi.toml"
    # cat all managed files to force template evaluation (managed alone
    # can skip lazy content rendering)
    "$CHEZMOI" --source . --config "$conf/chezmoi.toml" \
        --destination "$dest" cat >/dev/null 2>>"$tmp/err-$1-$2.log"
    "$CHEZMOI" --source . --config "$conf/chezmoi.toml" \
        --destination "$dest" managed 2>"$tmp/err-$1-$2.log"
}

check() { # check <desc> <cond...>
    local desc="$1"; shift
    if "$@"; then
        echo "  ok   $desc"
    else
        echo "  FAIL $desc"
        fail=1
    fi
}

has() { grep -qx "$1" <<<"$2"; }      # exact path match
none() { ! grep -q "$1" <<<"$2"; }    # no path matching regex

echo "== desktop / hyprland,cosmic =="
m="$(managed_files desktop hyprland,cosmic)" || { cat "$tmp/err-desktop-hyprland,cosmic.log"; exit 1; }
check ".zshrc deployed"            has ".zshrc" "$m"
check "hyprland.conf deployed"     has ".config/hypr/hyprland.conf" "$m"
check "ags app deployed"           has ".config/ags/app.tsx" "$m"
check "cosmic deployed"            bash -c "grep -q '^\.config/cosmic/' <<<'$m'"
check "packages/ NOT deployed"     none "^packages(/|$)" "$m"
check "install/ NOT deployed"      none "^install(/|$)" "$m"
check "AGENTS.md NOT deployed"     none "^AGENTS\.md$" "$m"
check "bin helpers deployed"       has ".local/bin/dots-adopt" "$m"

echo "== laptop / hyprland =="
m="$(managed_files laptop hyprland)" || { cat "$tmp/err-laptop-hyprland.log"; exit 1; }
check "hyprland.conf deployed"     has ".config/hypr/hyprland.conf" "$m"
check "ags deployed"               has ".config/ags/app.tsx" "$m"
check "cosmic NOT deployed"        none "\.config/cosmic" "$m"
check "machine.json rendered"      has ".config/ags/machine.json" "$m"

echo "== server / none =="
m="$(managed_files server none)" || { cat "$tmp/err-server-none.log"; exit 1; }
check ".zshrc deployed"            has ".zshrc" "$m"
check "hyprland NOT deployed"      none "\.config/hypr" "$m"
check "ags NOT deployed"           none "\.config/ags" "$m"
check "cosmic NOT deployed"        none "\.config/cosmic" "$m"
check "no GUI config at all"       none "vesktop|MangoHud|anyrun|waybar|swaync" "$m"
check "bin helpers deployed"       has ".local/bin/pkg-drift" "$m"
check "packages/ NOT deployed"     none "^packages(/|$)" "$m"

echo "== render templates (desktop) =="
conf="$tmp/conf-desktop"; mkdir -p "$conf"
printf '[data]\nrole = "desktop"\ndes = "hyprland,cosmic"\n' >"$conf/chezmoi.toml"
out="$("$CHEZMOI" --source . --config "$conf/chezmoi.toml" \
    execute-template '{{ index .machines .role "primary_display" }}')"
check "machines.toml resolves"     test "$out" = "DP-3"

[ "$fail" = 0 ] && echo "render-check: all checks passed"
exit "$fail"
