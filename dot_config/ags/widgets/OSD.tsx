import app from "ags/gtk4/app"
import { Astal } from "ags/gtk4"
import { Accessor, createBinding } from "ags"
import { timeout } from "ags/time"
import Wp from "gi://AstalWp"
import brightness from "../services/brightness"
import { registerWindow, getWindow } from "../lib/utils"

const OSD_TIMEOUT = 2000

function OsdWindow({
    name,
    monitor,
    icon,
    value,
}: {
    name: string
    monitor: number
    icon: string
    value: Accessor<number>
}) {
    return (
        <window
            name={name}
            monitor={monitor}
            application={app}
            namespace="ags-osd"
            class="osd-window"
            visible={false}
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.NONE}
            anchor={Astal.WindowAnchor.BOTTOM}
            marginBottom={80}
            $={registerWindow}
        >
            <box class="osd" orientation="vertical" spacing={8} margin={16} widthRequest={200}>
                <image iconName={icon} pixelSize={48} />
                <slider hexpand value={value} sensitive={false} />
                <label label={value((v) => `${Math.round(v * 100)}%`)} />
            </box>
        </window>
    )
}

let osdTimer: ReturnType<typeof timeout> | null = null

function flash(name: string) {
    const win = getWindow(name)
    if (!win) return
    win.visible = true
    osdTimer?.cancel()
    osdTimer = timeout(OSD_TIMEOUT, () => (win.visible = false))
}

const BRIGHTNESS_OSD = "brightness-osd"
const AUDIO_OSD = "audio-osd"

export const BrightnessOsd = (monitor: number) => (
    <OsdWindow
        name={BRIGHTNESS_OSD}
        monitor={monitor}
        icon="display-brightness-symbolic"
        value={brightness.screen}
    />
)

export function AudioOsd(monitor: number) {
    const speaker = Wp.get_default()?.audio.default_speaker
    if (!speaker) return null
    return (
        <OsdWindow
            name={AUDIO_OSD}
            monitor={monitor}
            icon="audio-volume-high-symbolic"
            value={createBinding(speaker, "volume")}
        />
    )
}

/**
 * Flash the OSDs when brightness/volume change. Call once from app.start.
 * The muted state is treated as volume 0, matching the v1 behavior.
 */
export function setupOsdListeners() {
    let lastBright = brightness.screen()
    brightness.screen.subscribe((v) => {
        if (v !== lastBright) flash(BRIGHTNESS_OSD)
        lastBright = v
    })

    const speaker = Wp.get_default()?.audio.default_speaker
    let lastVol = speaker?.mute ? 0 : (speaker?.volume ?? 0)
    speaker?.connect("notify", () => {
        const v = speaker.mute ? 0 : speaker.volume
        if (v !== lastVol) flash(AUDIO_OSD)
        lastVol = v
    })
}
