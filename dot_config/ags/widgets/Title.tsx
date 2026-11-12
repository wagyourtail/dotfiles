import { createBinding } from "ags"
import Hyprland from "gi://AstalHyprland"
import Pango from "gi://Pango"

const hypr = Hyprland.get_default()

/** Focused window title (center of the bar). */
export default function Title() {
    const client = createBinding(hypr, "focused_client")

    return (
        <box
            class={client((c) =>
                c?.fullscreen ? "focused-title fullscreen" : "focused-title",
            )}
            visible={client((c) => !!c)}
        >
            <label
                label={client((c) => c?.title ?? "")}
                maxWidthChars={60}
                ellipsize={Pango.EllipsizeMode.END}
            />
        </box>
    )
}
