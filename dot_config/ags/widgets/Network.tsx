import { createBinding, createComputed, For } from "ags"
import Network from "gi://AstalNetwork"
import { toggleWindow } from "../lib/utils"
import PopupWindow from "./PopupWindow"

const net = Network.get_default()
const WINDOW_NAME = "network"

const primary = createBinding(net, "primary")
const wifi = net.get_wifi()
const wired = net.get_wired()

/** Wired/wifi indicator icon + tooltip, toggles the network menu. */
export function NetworkIndicator() {
    const icon = createComputed(() => {
        const w = wifi && createBinding(wifi, "icon_name")()
        const e = wired && createBinding(wired, "icon_name")()
        return primary() === "wired" ? e ?? "network-wired-symbolic" : w ?? "network-wireless-offline-symbolic"
    })

    const tooltip = createComputed(() => {
        if (primary() === "wired") return "Wired"
        return (wifi && createBinding(wifi, "ssid")()) || "No network"
    })

    return (
        <button class="network" tooltipMarkup={tooltip} onClicked={() => toggleWindow(WINDOW_NAME)}>
            <image iconName={icon} />
        </button>
    )
}

export const NetworkMenu = (monitor: number) => (
    <PopupWindow name={WINDOW_NAME} monitor={monitor}>
        <box class="network-menu" vertical spacing={8} widthRequest={280}>
            <label
                class="network-primary"
                label={primary((p) => (p === "wired" ? "Wired" : "Wireless"))}
                xalign={0}
            />
            {wifi && (
                <box vertical spacing={4}>
                    <box spacing={8}>
                        <label
                            label={createBinding(wifi, "ssid")((s) => s ?? "disconnected")}
                            xalign={0}
                            hexpand
                        />
                        <button
                            label="rescan"
                            onClicked={() => wifi.scan()}
                        />
                    </box>
                    <scrolledwindow maxContentHeight={240} propagateNaturalHeight>
                        <box vertical>
                            <For each={createBinding(wifi, "access_points")}>
                                {(ap: Network.AccessPoint) => (
                                    <box class="network-ap" spacing={8}>
                                        <image iconName={createBinding(ap, "icon_name")} />
                                        <label label={ap.ssid ?? "?"} xalign={0} hexpand />
                                        <label label={`${ap.strength}%`} />
                                    </box>
                                )}
                            </For>
                        </box>
                    </scrolledwindow>
                </box>
            )}
        </box>
    </PopupWindow>
)
