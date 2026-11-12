import { execAsync } from "ags/process"
import { Gtk } from "ags/gtk4"
import { toggleWindow, hideWindow } from "../lib/utils"
import PopupWindow from "./PopupWindow"

const WINDOW_NAME = "power"

function PowerAction({
    icon,
    cmd,
    class: cls,
}: {
    icon: string
    cmd: string
    class: string
}) {
    return (
        <button
            class={cls}
            onClicked={() => {
                hideWindow(WINDOW_NAME)
                execAsync(cmd).catch(print)
            }}
        >
            <image iconName={icon} />
        </button>
    )
}

export function Power() {
    return (
        <button class={WINDOW_NAME} onClicked={() => toggleWindow(WINDOW_NAME)}>
            <image iconName="system-shutdown-symbolic" />
        </button>
    )
}

export const PowerMenu = (monitor: number) => (
    <PopupWindow name={WINDOW_NAME} monitor={monitor}>
        <box class="power-control" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
                <PowerAction
                    class="power-lock"
                    icon="system-lock-screen-symbolic"
                    cmd="hyprlock"
                />
                <PowerAction
                    class="power-logout"
                    icon="system-log-out-symbolic"
                    cmd="hyprctl dispatch exit"
                />
            </box>
            <box homogeneous spacing={8}>
                <PowerAction
                    class="power-suspend"
                    icon="media-playback-pause-symbolic"
                    cmd="systemctl suspend"
                />
                <PowerAction
                    class="power-restart"
                    icon="system-reboot-symbolic"
                    cmd="systemctl reboot"
                />
                <PowerAction
                    class="power-shutdown"
                    icon="system-shutdown-symbolic"
                    cmd="systemctl poweroff"
                />
            </box>
        </box>
    </PopupWindow>
)
