# dotfiles

Arch Linux dotfiles managed by [chezmoi](https://chezmoi.io). One repo serves
desktops, laptops, and headless servers; Hyprland and COSMIC can both be
installed per machine. No more per-machine branches — machine differences are
data (`.chezmoidata/machines.toml`) and per-host package slices.

## Fresh install from the Arch live ISO

```sh
curl -L https://raw.githubusercontent.com/wagyourtail/dotfiles/master/install.sh | sh
```

Prompts for **role** (desktop / laptop / server), **DE(s)** (hyprland, cosmic,
or both — server skips this), and **hostname**, then runs `archinstall`.
Disk layout, users, and credentials are asked by archinstall itself — nothing
sensitive lives in this repo. After reboot the dotfiles are already applied;
if that step was skipped in-chroot, just log in and re-run the same command —
it's idempotent.

Fully scripted alternative:

```sh
curl -LO https://raw.githubusercontent.com/wagyourtail/dotfiles/master/install.sh
sh install.sh --role laptop --des hyprland --hostname warch-laptop
```

To pin a branch/tag instead of master: `--branch <name>` or
`DOTFILES_BRANCH=<name>`.

## Bringing an existing machine under control (no reinstall)

Same one-liner on an installed system:

```sh
curl -L https://raw.githubusercontent.com/wagyourtail/dotfiles/master/install.sh | sh
```

It installs chezmoi, clones this repo to `~/.local/share/chezmoi`, and:

- if a legacy `~/dotfiles` (old symlink-based repo) exists → runs
  **dots-adopt**, which unwinds the old symlinks, walks `chezmoi diff`
  file-by-file (repo-wins / live-wins / merge / skip), backs everything up to
  a tarball, then applies;
- otherwise → `chezmoi apply` directly.

Or by hand: `chezmoi init wagyourtail/dotfiles` then
`~/.local/share/chezmoi/dot_local/bin/dots-adopt`.

## Daily use

```sh
chezmoi diff            # what would change
chezmoi apply           # deploy
chezmoi edit ~/.zshrc   # edit the SOURCE for a deployed file
chezmoi add ~/.config/foo   # start tracking a new file
```

`just` shortcuts: `just diff | apply | drift | switch | templates | lint`.

## Switching desktop environments

```sh
de-switch hyprland        # enable hyprland slices, disable cosmic
de-switch cosmic
de-switch hyprland,cosmic # keep both (default on the desktop)
de-switch hyprland --prune   # also remove the other DE's packages
```

## Packages

`packages/*.txt` are slices picked per role/des/hostname:

| slice | installed when |
|-------|----------------|
| `base`, `common-cli` | always (incl. servers) |
| `common-gui`, `dev` | any DE enabled |
| `de-hyprland`, `de-cosmic` | that DE enabled |
| `role-desktop`, `role-laptop`, `role-server` | matching role |
| `host-<hostname>` | matching hostname |

`*.aur.txt` twins are installed via `paru`. `pkg-drift` reports what's
installed that no slice claims, so live machines get curated into the repo
instead of drifted apart.

## Structure

See `AGENTS.md` for the full repo map and contributor/agent rules — it's
written for coding agents but is the most precise description of how the
repo fits together. Quick version:

- `dot_config/`, `dot_local/`, `dot_zshrc` → `~` (chezmoi naming)
- `dot_config/ags/` — ags v3/astal top bar (workspaces, title, tray, clock,
  network, audio w/ mixer + media, swaync, battery+brightness, power, OSDs);
  waybar kept as fallback
- `run_*` scripts → chaotic-aur repo, `paru`, package slices, hyprpm
- `install/` → archinstall JSON per role

## The bar

The old AGS v1 fork was replaced with a v3 rewrite. First `ags run` on a new
machine may need small fixes — it's bundle-checked, not yet runtime-tested.
`waybar` is installed as a fallback; swap `exec-once = ags run` for waybar in
`dot_config/hypr/hyprland.lua.tmpl` if needed.
