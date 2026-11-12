import app from "ags/gtk4/app"
import { readFile } from "ags/file"

export type Machine = {
    primary_display: string
    battery: boolean
}

/**
 * Per-machine data rendered by chezmoi from .chezmoidata/machines.toml.
 * SRC is the ags source dir (~/.config/ags).
 */
export const machine = JSON.parse(readFile(`${SRC}/machine.json`)) as Machine

/** Toggle a named popup window via the app's own window registry. */
export function toggleWindow(name: string) {
    app.toggle_window(name)
}

export function hideWindow(name: string) {
    app.get_window(name)?.hide()
}

/** Seconds → "2h 34m". */
export function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}
