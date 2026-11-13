import { createBinding, For } from "ags"
import { Gdk, Gtk } from "ags/gtk4"
import Tray from "gi://AstalTray"

const tray = Tray.get_default()

/** System tray items (SNI). Menu-type items show their D-Bus menu via
 * menubutton; normal items use activate/secondary_activate. */
export default function SysTray() {
    const items = createBinding(tray, "items")

    return (
        <box class="systray">
            <For each={items}>
                {(item) => {
                    if (item.is_menu) {
                        return (
                            <menubutton
                                class="systray-item"
                                tooltipMarkup={createBinding(item, "tooltip_markup")}
                                menuModel={createBinding(item, "menu_model")}
                                actionGroup={createBinding(item, "action_group")}
                                direction={Gtk.ArrowType.DOWN}
                                $={(self) => {
                                    const conn = self.connect("notify::active", () => {
                                        if (self.active) item.about_to_show()
                                    })
                                    self.connect("destroy", () => self.disconnect(conn))
                                }}
                            >
                                <image gicon={createBinding(item, "gicon")} pixelSize={16} />
                            </menubutton>
                        )
                    }
                    return (
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
                    )
                }}
            </For>
        </box>
    )
}
