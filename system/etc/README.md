# system/etc — repo-managed files deployed into /etc

`run_onchange_after_50-system.sh.tmpl` `sudo install`s every file found here
to the same relative path under `/etc` (e.g. `system/etc/sysctl.d/99-x.conf`
→ `/etc/sysctl.d/99-x.conf`), whenever contents change. This file itself is
skipped. Machine-local /etc files go under `system/host-<hostname>/etc/`.

Chezmoi itself only manages `$HOME` — this tree is the declarative layer for
system config. Heuristic: hardware-independent stuff (sysctl.d, NM profiles,
udev rules wanted everywhere) goes here; machine-specific config
(mkinitcpio hooks/modules, GPU driver options, filesystem quirks) goes in
`system/host-<hostname>/etc/` instead. Things that must exist before first
boot (hostname, services) live in `install/archinstall-*.json`.
