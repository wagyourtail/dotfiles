import { createSubprocess } from "ags/process"
import { execAsync } from "ags/process"

const WINDOW_NAME = "notifications"

// swaync-client -s streams a JSON blob on every change
const status = createSubprocess("", "swaync-client -s")

const count = status((line) => {
    try {
        return `${JSON.parse(line).count ?? 0}`
    } catch {
        return ""
    }
})

/** SwayNC notification count button — toggles the swaync panel. */
export function Notifications() {
    return (
        <button
            class="notifications-btn"
            onClicked={() => execAsync("swaync-client --toggle-panel").catch(print)}
        >
            <box spacing={4}>
                <image iconName="preferences-system-notifications-symbolic" />
                <label label={count} />
            </box>
        </button>
    )
}
