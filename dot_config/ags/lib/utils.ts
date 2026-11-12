import { readFile } from "ags/file"
import type { Gtk } from "ags/gtk4"

export type Machine = {
    primary_display: string
    battery: boolean
}

/**
 * Per-machine data rendered by chezmoi from .chezmoidata/machines.toml.
 * SRC is the ags source dir (~/.config/ags).
 */
export const machine = JSON.parse(readFile(`${SRC}/machine.json`)) as Machine

/** Registry of popup windows by name so any module can toggle them. */
const windows = new Map<string, Gtk.Window>()

/** Call from a <window $={...}> setup prop to register the window. */
export function registerWindow(self: Gtk.Window) {
    if (self.name) windows.set(self.name, self)
}

export function getWindow(name: string) {
    return windows.get(name)
}

export function toggleWindow(name: string) {
    const win = windows.get(name)
    if (win) win.visible = !win.visible
}

export function hideWindow(name: string) {
    const win = windows.get(name)
    if (win) win.visible = false
}

/** Seconds → "2h 34m". */
export function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}
