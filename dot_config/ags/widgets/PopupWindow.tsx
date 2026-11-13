import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { hideWindow } from "../lib/utils"
import type { JSX } from "ags"

type Props = {
    name: string
    monitor: number
    /** Where the content sits inside the fullscreen overlay. */
    layout?: "top-right" | "top-left" | "center" | "bottom-right" | "bottom-left"
    marginTop?: number
    marginEnd?: number
    marginStart?: number
    children?: JSX.Element
}

const HALIGN = {
    "top-right": Gtk.Align.END,
    "top-left": Gtk.Align.START,
    center: Gtk.Align.CENTER,
    "bottom-right": Gtk.Align.END,
    "bottom-left": Gtk.Align.START,
}
const VALIGN = {
    "top-right": Gtk.Align.START,
    "top-left": Gtk.Align.START,
    center: Gtk.Align.CENTER,
    "bottom-right": Gtk.Align.END,
    "bottom-left": Gtk.Align.END,
}

/**
 * Popup window: a fullscreen transparent layer-shell window that positions
 * `children` per `layout`. Clicking outside the content or pressing Escape
 * closes it. Toggle with `toggleWindow(name)` from lib/utils.
 */
export default function PopupWindow({
    name,
    monitor,
    layout = "top-right",
    marginTop = 32,
    marginEnd = 8,
    marginStart = 8,
    children,
}: Props) {
    return (
        <window
            name={name}
            monitor={monitor}
            application={app}
            namespace="ags-popup"
            class="popup-window"
            visible={false}
            layer={Astal.Layer.TOP}
            keymode={Astal.Keymode.NONE}
            exclusivity={Astal.Exclusivity.IGNORE}
            anchor={
                Astal.WindowAnchor.TOP |
                Astal.WindowAnchor.BOTTOM |
                Astal.WindowAnchor.LEFT |
                Astal.WindowAnchor.RIGHT
            }
        >
            <Gtk.EventControllerKey
                onKeyPressed={(self, keyval) => {
                    if (keyval === Gdk.KEY_Escape) {
                        hideWindow(name)
                        return true
                    }
                    return false
                }}
            />
            <overlay>
                {/* backdrop: catches clicks outside the content */}
                <box class="popup-backdrop" hexpand vexpand>
                    <Gtk.GestureClick
                        propagationPhase={Gtk.PropagationPhase.CAPTURE}
                        button={0}
                        onPressed={() => hideWindow(name)}
                    />
                </box>
                <box
                    $type="overlay"
                    class="window-content"
                    halign={HALIGN[layout]}
                    valign={VALIGN[layout]}
                    marginTop={marginTop}
                    marginEnd={marginEnd}
                    marginStart={marginStart}
                    marginBottom={8}
                >
                    {children}
                </box>
            </overlay>
        </window>
    )
}
