import { createBinding, createComputed, For } from "ags"
import { Gtk } from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"

const hypr = Hyprland.get_default()

type WsButton = { id: number; label: string; focused: boolean; occupied: boolean }

/**
 * Workspace indicator: one button per id 1..max (named workspaces show their
 * name, like the v1 bar). Scroll cycles workspaces.
 */
export default function Workspaces() {
    const workspaces = createBinding(hypr, "workspaces")
    const focusedWs = createBinding(hypr, "focused_workspace")
    const focusedMon = createBinding(hypr, "focused_monitor")

    const buttons = createComputed((): WsButton[] => {
        const wss = workspaces()
        const focused = focusedWs()
        const mon = focusedMon()
        const visible = mon
            ? wss.filter((ws) => ws.monitor?.id === mon.id)
            : wss
        const byId = new Map(visible.map((ws) => [ws.id, ws]))
        const max = Math.max(5, ...visible.map((ws) => ws.id), 0)
        const out: WsButton[] = []
        for (let id = 1; id <= max; id++) {
            const ws = byId.get(id)
            const named = ws && ws.name !== String(id)
            out.push({
                id,
                label: named ? ws!.name : String(id),
                focused: focused?.id === id,
                occupied: (ws?.clients.length ?? 0) > 0,
            })
        }
        return out
    })

    return (
        <box class="workspaces">
            <Gtk.EventControllerScroll
                flags={Gtk.EventControllerScrollFlags.VERTICAL}
                onScroll={(_, _dx, dy) =>
                    hypr.dispatch("workspace", dy > 0 ? "+1" : "-1")
                }
            />
            <For each={buttons}>
                {(ws) => (
                    <button
                        class={ws.focused ? "focused" : ws.occupied ? "occupied" : ""}
                        onClicked={() => hypr.dispatch("workspace", `${ws.id}`)}
                    >
                        <label label={ws.label} />
                    </button>
                )}
            </For>
        </box>
    )
}
