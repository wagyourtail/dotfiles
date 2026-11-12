import app from "ags/gtk4/app"
import { exec } from "ags/process"
import GLib from "gi://GLib"
import Bar from "./widgets/Bar"
import { CalendarMenu } from "./widgets/Time"
import { AudioMenu } from "./widgets/Audio"
import { NetworkMenu } from "./widgets/Network"
import { BatteryMenu } from "./widgets/Battery"
import { PowerMenu } from "./widgets/Power"
import { BrightnessOsd, AudioOsd, setupOsdListeners } from "./widgets/OSD"
import { machine } from "./lib/utils"

// dart-sass (packages/de-hyprland.txt) compiles the scss pipeline to a
// runtime css file; keep it out of the source dir so nothing gets committed.
const css = `${GLib.get_user_cache_dir()}/ags/my-style.css`
exec(`mkdir -p ${GLib.get_user_cache_dir()}/ags`)
exec(`sass ${SRC}/style/main.scss ${css}`)

app.start({
    css,
    main() {
        // machine.json (chezmoi-rendered) names the primary display's
        // connector; fall back to monitor 0 for unlisted machines.
        const monitors = app.get_monitors()
        const mon = Math.max(
            0,
            monitors.findIndex((m) => m.connector === machine.primary_display),
        )

        Bar(mon)
        CalendarMenu(mon)
        AudioMenu(mon)
        NetworkMenu(mon)
        PowerMenu(mon)
        BrightnessOsd(mon)
        AudioOsd(mon)
        if (machine.battery) BatteryMenu(mon)
        setupOsdListeners()
    },
})
