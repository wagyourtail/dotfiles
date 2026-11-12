import app from "ags/gtk4/app"
import { Astal, Gtk } from "ags/gtk4"
import Workspaces from "./Workspaces"
import Title from "./Title"
import SysTray from "./SysTray"
import { Time } from "./Time"
import { NetworkIndicator } from "./Network"
import { Notifications } from "./Notifications"
import { AudioIndicator } from "./Audio"
import { BatteryIndicator } from "./Battery"
import { Power } from "./Power"
import { machine } from "../lib/utils"

/** Top bar: workspaces | focused title | tray, clock, indicators, power. */
export default function Bar(monitor: number) {
    return (
        <window
            name="bar"
            monitor={monitor}
            application={app}
            namespace="ags-bar"
            class="bar"
            visible
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={
                Astal.WindowAnchor.TOP |
                Astal.WindowAnchor.LEFT |
                Astal.WindowAnchor.RIGHT
            }
        >
            <centerbox class="bar-bg">
                <box $type="start" class="bar-start">
                    <Workspaces />
                </box>
                <box $type="center" class="bar-center">
                    <Title />
                </box>
                <box $type="end" class="bar-end" halign={Gtk.Align.END}>
                    <SysTray />
                    <Time />
                    <NetworkIndicator />
                    <Notifications />
                    <AudioIndicator />
                    {machine.battery && <BatteryIndicator />}
                    <Power />
                </box>
            </centerbox>
        </window>
    )
}
