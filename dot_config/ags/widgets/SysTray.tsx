import { createBinding, For } from "ags"
import { Gdk, Gtk } from "ags/gtk4"
import Tray from "gi://AstalTray"

const tray = Tray.get_default()

/** System tray items (SNI). Primary activates, secondary opens the item menu. */
export default function SysTray() {
    const items = createBinding(tray, "items")

    return (
        <box class="systray">
            <For each={items}>
                {(item) => (
                    <box>
                        <Gtk.GestureClick
                            button={Gdk.BUTTON_SECONDARY}
                            onPressed={() => item.secondary_activate(0, 0)}
                        />
                        <button
                            class="systray-item"
                            tooltipMarkup={createBinding(item, "tooltip_markup")}
                            onClicked={() => item.activate(0, 0)}
                        >
                            <image gicon={createBinding(item, "gicon")} pixelSize={16} />
                        </button>
                    </box>
                )}
            </For>
        </box>
    )
}
