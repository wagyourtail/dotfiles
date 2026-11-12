import { createState } from "ags"
import { monitorFile, readFile } from "ags/file"
import { exec, execAsync } from "ags/process"
import Gio from "gi://Gio"

/**
 * Screen brightness service (0..1).
 * Reads /sys/class/backlight directly (works with any writer: keys,
 * brightnessctl, ddcutil) and writes via `brightnessctl`.
 */
const SYSFS = "/sys/class/backlight"

function findDevice(): string | null {
    const dir = Gio.File.new_for_path(SYSFS)
    try {
        const it = dir.enumerate_children(
            "standard::name",
            Gio.FileQueryInfoFlags.NONE,
            null,
        )
        const info = it.next_file(null)
        return info ? info.get_name() : null
    } catch {
        return null
    }
}

const device = findDevice()
const maxBrightness = device
    ? Number(readFile(`${SYSFS}/${device}/max_brightness`)) || 1
    : 1

const [screen, setScreen] = createState(
    device
        ? Number(readFile(`${SYSFS}/${device}/actual_brightness`)) / maxBrightness
        : 0,
)

if (device) {
    monitorFile(`${SYSFS}/${device}/actual_brightness`, (file) => {
        setScreen(Number(readFile(file)) / maxBrightness)
    })
}

export default {
    get available() {
        return device !== null
    },
    get screen() {
        return screen
    },
    set screen(v: number) {
        execAsync(`brightnessctl set ${Math.round(v * 100)}%`).catch(print)
    },
}
