# Task runner for this repo — `just <recipe>`. Agents should prefer these
# recipes over improvising chezmoi invocations (see AGENTS.md).

# show what `chezmoi apply` would change
diff:
    chezmoi diff

# deploy the source state to $HOME
apply:
    chezmoi apply

# report installed packages vs selected slices
drift:
    pkg-drift

# switch enabled DEs — `just switch hyprland` or `just switch hyprland --prune`
switch des="":
    de-switch {{des}}

# unwind legacy ~/dotfiles and reconcile live config into the repo
adopt:
    ~/.local/share/chezmoi/dot_local/bin/dots-adopt

# render every role×des combo and assert correct (non-)deployment
templates:
    ./scripts/render-check.sh

# syntax-check all shell code and validate the archinstall JSONs
lint:
    bash -n install.sh
    bash -n dot_local/bin/dots-adopt dot_local/bin/de-switch dot_local/bin/pkg-drift
    bash -n run_once_*.sh scripts/render-check.sh
    python3 -m json.tool install/archinstall-desktop.json >/dev/null
    python3 -m json.tool install/archinstall-laptop.json >/dev/null
    python3 -m json.tool install/archinstall-server.json >/dev/null
    python3 -c 'import tomllib; tomllib.load(open(".chezmoidata/machines.toml","rb"))'
    @echo "lint ok"

# pull + apply (chezmoi update)
update:
    chezmoi update
