import { createBinding, createComputed, For } from "ags"
import { Gtk } from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"

const hypr = Hyprland.get_default()

type WsButton = { slot: number; label: string; focused: boolean; occupied: boolean }

/**
 * Workspace indicator: buttons are per-monitor *slots* (matching the r~N
 * binds) — the Nth existing workspace on the active monitor is button N,
 * regardless of its absolute hyprland id. Scroll cycles monitor workspaces.
 */
export default function Workspaces() {
    const workspaces = createBinding(hypr, "workspaces")
    const focusedWs = createBinding(hypr, "focused_workspace")
    const focusedMon = createBinding(hypr, "focused_monitor")

    const buttons = createComputed((): WsButton[] => {
        const wss = workspaces()
        const focused = focusedWs()
        const mon = focusedMon()
        const visible = (
            mon ? wss.filter((ws) => ws.monitor?.id === mon.id) : wss
        ).sort((a, b) => a.id - b.id)
        const count = Math.max(5, visible.length)
        const out: WsButton[] = []
        for (let slot = 1; slot <= count; slot++) {
            const ws = visible[slot - 1]
            const named = ws && ws.name !== String(ws.id)
            out.push({
                slot,
                label: named ? ws!.name : String(slot),
                focused: !!ws && focused?.id === ws.id,
                occupied: (ws?.clients?.length ?? 0) > 0,
            })
        }
        return out
    })

    return (
        <box class="workspaces">
            <Gtk.EventControllerScroll
                flags={Gtk.EventControllerScrollFlags.VERTICAL}
                onScroll={(_, _dx, dy) =>
                    hypr.dispatch("workspace", dy > 0 ? "m+1" : "m-1")
                }
            />
            <For each={buttons}>
                {(ws) => (
                    <button
                        class={ws.focused ? "focused" : ws.occupied ? "occupied" : ""}
                        onClicked={() => hypr.dispatch("workspace", `r~${ws.slot}`)}
                    >
                        <label label={ws.label} />
                    </button>
                )}
            </For>
        </box>
    )
}
