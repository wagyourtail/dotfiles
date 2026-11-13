# AGENTS.md — working in this dotfiles repo

This is a [chezmoi](https://chezmoi.io) source repository for Arch Linux
machines. Agents (opencode, Devin, etc.) should read this before changing
anything. Human-facing docs live in `README.md`; this file is the operating
manual.

## Mental model

- **Source state → `$HOME`**. Files here deploy to the home directory using
  chezmoi naming: `dot_config/` → `~/.config`, `dot_local/bin/` → `~/.local/bin`,
  `dot_zshrc` → `~/.zshrc`, `dot_foo.tmpl` → `~/.foo` rendered as a template.
- **Per-machine identity** is two values in `~/.config/chezmoi/chezmoi.toml`:
  - `role` — `desktop` | `laptop` | `server`
  - `des` — comma list of enabled DEs: `hyprland`, `cosmic`, or `none` (server)
  - `.chezmoi.toml.tmpl` prompts for these at `chezmoi init` (role resolves
    from the `[hosts]` map in `.chezmoidata/machines.toml` when the hostname is
    known; automation pre-seeds the file — see `install.sh`, `dots-adopt`).
- **Per-role data** (monitor layout, primary display, battery flag, extra
  hyprland vars) lives in `.chezmoidata/machines.toml` under `[machines.<role>]`.
  Reference in templates: `{{ index .machines .role "primary_display" }}`.
- **Hyprland ≥0.55 is Lua-only for the compositor config** — hyprlang
  (`hyprland.conf` syntax) was dropped in 0.57. `dot_config/hypr/hyprland.lua.tmpl`
  is the config; `hypridle.conf`/`hyprlock.conf` are separate packages and still
  hyprlang. `machines.<role>.monitors` is an array of tables (`output` is a lua
  identifier → `primary_display`/`vars`, `""` = catch-all). `hl.dsp.*` dispatchers
  replace legacy `hyprctl dispatch <name>` — `dot_local/bin/lib/hyprland.py`
  wraps them; don't reintroduce bare dispatcher names.
- **Package slices** in `packages/*.txt` (+ `.aur.txt` variants) pick what
  `.chezmoiscripts/run_onchange_after_30-packages.sh.tmpl` installs. Group selection is
  computed in that template from role/des/hostname, plus any `extras` slice
  names in chezmoi.toml (`extras = "extra"` opts into `packages/extra.txt` —
  the opt-in slice for heavy/niche packages trimmed from the defaults).

## Repo map

```
.chezmoi.toml.tmpl        init-time prompts → chezmoi.toml [data]
.chezmoidata/machines.toml [hosts] name→role, [machines.<role>] per-role vars
.chezmoiexternal.toml     git externals (oh-my-zsh, Sweet theme)
.chezmoiignore.tmpl       what NOT to deploy (repo files, wrong-DE config)
dot_config/               ~/.config — hypr/, ags/, cosmic/, waybar/, …
dot_local/bin/            ~/.local/bin — de-switch, pkg-drift, dots-adopt, …
dot_local/share/dots/     deployed runtime assets (hyprlock bg image)
dot_zshrc                 shell config
.chezmoiscripts/          run_* scripts (chezmoi runs these, not deployed):
                          once: repos→paru→services→snapper; onchange: pkgs, system
packages/                 package slices (see header comments in each file)
packages/flatpak.txt      flatpak apps (user-scope; skipped on headless)
system/                   repo-managed system files → deployed to / (see below)
install/                  archinstall JSON profiles per role
install.sh                curl|sh entrypoint (ISO + installed systems)
scripts/render-check.sh   render assertions for every role×des (CI)
justfile                  named recipes: diff apply drift switch templates lint
```

## Common tasks

- **Add a package**: pick the slice — `base` (everyone), `common-cli`
  (incl. servers), `common-gui` (needs a DE), `dev`, `de-hyprland`,
  `de-cosmic`, `role-{desktop,laptop,server}`, `host-<hostname>` for
  machine-local. AUR-only goes in the `.aur.txt` twin. Then `chezmoi apply`
  (or it runs on next apply automatically via the onchange hash).
- **Add/adjust a dotfile**: prefer `chezmoi edit ~/.config/x` / `chezmoi add`
  on the live machine; when editing the repo directly keep the `dot_` naming
  and run `just templates` after touching `.tmpl` logic.
- **Add a machine**: `[hosts]` entry in machines.toml; if the role is new,
  add `[machines.<role>]` and `packages/role-<role>.txt`; if the hostname
  needs one-off packages add `packages/host-<hostname>.txt`.
- **Switch DEs on a live machine**: `de-switch hyprland|cosmic [--prune]`
  (or `just switch …`). Never hand-edit `des` in chezmoi.toml — de-switch
  keeps it and the package slices consistent.
- **Curate drift**: `pkg-drift` lists installed-but-untracked packages;
  move real ones into slices, ignore the rest.
- **Manage a system file**: drop it under `system/` at its absolute path
  (`system/etc/sysctl.d/99-x.conf` → `/etc/sysctl.d/99-x.conf`); the
  `.chezmoiscripts/run_onchange_after_50-system` script `sudo install`s it on next apply.
  Machine-local system files go under `system/host-<hostname>/`. Prefer
  drop-in dirs over whole files; `mirrorlist` stays unmanaged
  (reflector-maintained, `NoUpgrade`'d in pacman.conf).

## Guardrails

- **Never edit deployed targets in place** (`~/.config/foo`) as the source of
  truth — edit the repo, `chezmoi apply`. `chezmoi edit` is fine (it edits
  the source).
- **No `chezmoi apply --force`**, no deleting target files, unless the user
  explicitly asks.
- **No secrets in the repo.** Anything sensitive needs chezmoi's age/gpg
  integration — ask the user first. `install/` credentials stay in
  archinstall's interactive prompts.
- **Machine-local values** (IPs, mounts, hardware quirks) go in
  `host-<hostname>.txt` or chezmoi.toml data — never hardcode into shared
  slices/templates.
- **Templates must render for every role×des**. After changing any `.tmpl`,
  `.chezmoiignore.tmpl`, or `.chezmoi.toml.tmpl`, run `just templates`
  (needs a `chezmoi` binary; `CHEZMOI=/path ./scripts/render-check.sh`).
- `.chezmoiscripts/run_onchange_after_30-packages.sh.tmpl` installs packages and may call
  `pacman`/AUR helpers with sudo — keep it idempotent and never add
  interactive steps that block unattended apply. Its preflight detects
  slice↔installed package conflicts: it prompts keep/replace via `/dev/tty`
  when a controlling terminal exists; unattended runs list the conflicts and
  exit non-zero. `keep` decisions persist in
  `~/.local/state/dots/pkg-overrides` (machine-local; delete to re-prompt) —
  to make one permanent, rename the package in `packages/` instead.
- `install.sh` is `curl | sh`-able: keep it POSIX sh, `set -eu`, no
  dependencies beyond what an Arch ISO guarantees (python3, curl).
- **`.pacnew` debt**: a hook (`system/etc/pacman.d/hooks/99-pacnew-report.hook`
  → `pacnew-sweep`) auto-drops identical pacnews and reports the rest after
  every transaction. Never auto-merge — merges need a human (`sudo pacdiff`).
  For repo-managed /etc files, merge upstream changes into the REPO copy.

## ags bar (dot_config/ags)

- Rewritten for **ags v3 / astal / GTK4** (`aylurs-gtk-shell` + `libastal-meta`
  AUR packages, compiled scss via `dart-sass`). v1 APIs (`Widget.*`,
  `Service.import`, `Variable`, `Utils.*`) are gone — use `createBinding`,
  `createComputed`, `createState`, `For`, `With`, `<Gtk.*>` controllers.
- Per-machine bits come from `machine.json` (chezmoi-rendered) — monitor
  connector + battery flag, NOT hardcoded names.
- Popups toggle via `app.toggle_window`/`app.get_window` (`lib/utils.ts`
  `toggleWindow`/`hideWindow` wrap them); `ags toggle <name>` works too.
- SNI tray: `is_menu` items (nm-applet, steam) need a `menubutton` +
  `menu_model` + `insert_action_group("dbusmenu", item.action_group)` +
  `about_to_show()` on activate; normal items use
  `item.activate`/`secondary_activate`. `activate` on a menu item is a spec no-op.
- **Runtime-verified on live hyprland** (bar, popups, systray, workspaces).
  Waybar remains installed as the fallback bar.

## Verification

- `just lint` — bash -n on all shell, JSON + TOML validation.
- `just templates` — renders every role×des combo, asserts deployment sets
  (server must get zero GUI config; repo files must never land in $HOME).
- esbuild smoke: `cd dot_config/ags && npx esbuild app.tsx --bundle
  --external:'ags*' --external:'gi://*' --outfile=/dev/null`
- Can't verify → say so in the PR/report. Don't claim runtime-tested.

- **NVIDIA machines**: `nvidia-all` (frogging-family -tkg driver) isn't in any
  repo/AUR and is interactive by design, so it can't be a slice entry.
  `.chezmoiscripts/run_once_after_80-nvidia-tkg.sh` detects the GPU via
  `lspci`, clones the repo to `~/.local/src/nvidia-all`, and offers the build
  on a tty. Local `-U` tkg packages (e.g. `opencl-nvidia-tkg`) are expected
  pkg-drift entries.
