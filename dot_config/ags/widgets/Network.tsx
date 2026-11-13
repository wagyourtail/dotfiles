import { createBinding, createComputed, For } from "ags"
import { Gtk } from "ags/gtk4"
import Network from "gi://AstalNetwork"
import { toggleWindow } from "../lib/utils"
import PopupWindow from "./PopupWindow"

const net = Network.get_default()
const WINDOW_NAME = "network"

const primary = createBinding(net, "primary")
const wifi = net.get_wifi()
const wired = net.get_wired()

/** Wired/wifi indicator icon + tooltip, toggles the network menu.
 * Wired wins whenever NM reports it as the primary connection. */
export function NetworkIndicator() {
    const icon = createComputed(() => {
        if (primary() === Network.Primary.WIRED) {
            return (wired && createBinding(wired, "icon_name")()) || "network-wired-symbolic"
        }
        return (wifi && createBinding(wifi, "icon_name")()) || "network-wireless-offline-symbolic"
    })

    const tooltip = createComputed(() => {
        if (primary() === Network.Primary.WIRED) {
            const speed = wired ? createBinding(wired, "speed")() : 0
            return speed > 0 ? `Wired · ${speed} Mbps` : "Wired"
        }
        return (wifi && createBinding(wifi, "ssid")()) || "No network"
    })

    return (
        <button class="network" tooltipMarkup={tooltip} onClicked={() => toggleWindow(WINDOW_NAME)}>
            <image iconName={icon} />
        </button>
    )
}

const aps = wifi
    ? createBinding(wifi, "access_points")((list) =>
          [...list]
              .filter((ap) => ap.ssid)
              .sort((a, b) => Number(b.active) - Number(a.active) || b.strength - a.strength)
              .slice(0, 20),
      )
    : null

/** Disconnect the wifi device; falls back to re-activating if the
 * device handle is unavailable. */
function disconnectWifi() {
    try {
        wifi?.device?.disconnect_async(null, null)
    } catch (e) {
        console.error(`wifi disconnect failed: ${e}`)
    }
}

export const NetworkMenu = (monitor: number) => (
    <PopupWindow name={WINDOW_NAME} monitor={monitor}>
        <box class="network-menu" orientation={Gtk.Orientation.VERTICAL} spacing={8} widthRequest={300}>
            {wired && (
                <box class="network-wired" spacing={8}>
                    <image iconName={createBinding(wired, "icon_name")} />
                    <label
                        label={createComputed(() => {
                            const speed = createBinding(wired, "speed")()
                            const internet = createBinding(wired, "internet")()
                            const status =
                                internet === Network.Internet.CONNECTED
                                    ? `Wired${speed > 0 ? ` · ${speed} Mbps` : ""}`
                                    : internet === Network.Internet.CONNECTING
                                      ? "Wired (connecting)"
                                      : "Wired (unplugged)"
                            return status
                        })}
                        xalign={0}
                        hexpand
                    />
                </box>
            )}
            {wifi && (
                <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                    <box spacing={8}>
                        <label label="Wi-Fi" xalign={0} hexpand />
                        <button label="rescan" onClicked={() => wifi.scan()} />
                        <Gtk.Switch
                            active={createBinding(wifi, "enabled")}
                            onNotifyActive={(self) => {
                                if (self.active !== wifi.enabled) wifi.set_enabled(self.active)
                            }}
                        />
                    </box>
                    <scrolledwindow maxContentHeight={280} propagateNaturalHeight>
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <For each={aps}>
                                {(ap: Network.AccessPoint) => (
                                    <button
                                        class="network-ap"
                                        onClicked={() =>
                                            createBinding(ap, "active")() ? disconnectWifi() : ap.activate()
                                        }
                                    >
                                        <box spacing={8}>
                                            <image iconName={createBinding(ap, "icon_name")} />
                                            <label label={createBinding(ap, "ssid")} xalign={0} hexpand />
                                            {ap.requires_password && (
                                                <image iconName="network-wireless-encrypted-symbolic" />
                                            )}
                                            <label label={`${ap.strength}%`} />
                                            <image
                                                iconName="object-select-symbolic"
                                                visible={createBinding(ap, "active")}
                                            />
                                        </box>
                                    </button>
                                )}
                            </For>
                        </box>
                    </scrolledwindow>
                </box>
            )}
        </box>
    </PopupWindow>
)
