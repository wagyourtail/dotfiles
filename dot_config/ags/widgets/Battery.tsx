import { createBinding, createComputed } from "ags"
import Battery from "gi://AstalBattery"
import { toggleWindow, formatDuration } from "../lib/utils"
import PopupWindow from "./PopupWindow"
import brightness from "../services/brightness"

const bat = Battery.get_default()
const WINDOW_NAME = "battery"

/** Battery button (only rendered when machine.battery is set) + brightness menu. */
export function BatteryIndicator() {
    const tooltip = createComputed(() => {
        const ch = createBinding(bat, "charging")()
        const secs = ch
            ? createBinding(bat, "time_to_full")()
            : createBinding(bat, "time_to_empty")()
        return `${ch ? "Charging" : "Discharging"}\n${formatDuration(secs)} remaining`
    })

    return (
        <button
            class="battery"
            visible={createBinding(bat, "is_present")}
            tooltipMarkup={tooltip}
            onClicked={() => toggleWindow(WINDOW_NAME)}
        >
            <image iconName={createBinding(bat, "icon_name")} />
            <label
                label={createBinding(bat, "percentage")((p) => `${Math.round(p * 100)}%`)}
            />
        </button>
    )
}

export const BatteryMenu = (monitor: number) => (
    <PopupWindow name={WINDOW_NAME} monitor={monitor}>
        <box class="battery-menu" spacing={8} widthRequest={220}>
            <image iconName="display-brightness-symbolic" />
            <slider
                hexpand
                visible={brightness.available}
                value={brightness.screen((v) => v)}
                onChangeValue={({ value }) => (brightness.screen = value)}
            />
            <label
                visible={brightness.available}
                label={brightness.screen((v) => `${Math.round(v * 100)}%`)}
            />
        </box>
    </PopupWindow>
)
