import { Audio, AudioMenu } from "audio";
import { Battery, BatteryBox } from "battery";
import { Title, Workspaces } from "hyprland";
import { Power, PowerMenu } from "power";
import { sysTray } from "systray";
import { Time, CalendarMenu } from "time";
import { Notifications } from "notifications";
import { monitorIdFromName } from "utils";
import { Network, NetworkMenu } from "network";
import { BrightnessBox, AudioBox } from "popups";
// import { Applist } from "widgets/Applist";

const scss = `${App.configDir}/style/main.scss`;
const css = `${App.configDir}/my-style.css`;

// package `dart-sass` for Arch linux
Utils.exec(`sass ${scss} ${css}`);

export const PANEL_MARGIN_Y = 32;
export const mon = monitorIdFromName("eDP-2");

const Bar = (monitor = 0) =>
  Widget.Window({
    monitor,
    name: `bar${monitor}`,
    class_name: "bar",
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    child: Widget.CenterBox({
      start_widget: Widget.Box({
        class_name: "bar-start",
        children: [Workspaces(), ],
      }),
      center_widget: Widget.Box({
        class_name: "bar-center",
        children: [Title(), ],
      }),
      end_widget: Widget.Box({
        class_name: "bar-end",
        hpack: "end",
        children: [sysTray, Time(), Network(), Notifications(), Audio(), Battery(), Power(), ],
      }),
    }),
  });

// const Panel = (monitor = 0) =>
//   Widget.Window({
//     monitor,
//     name: `panel${monitor}`,
//     class_name: "panel",
//     anchor: ["bottom", "left", "right"],
//     exclusivity: "exclusive",
//     child: Widget.CenterBox({
//       center_widget: Widget.Box({
//         spacing: 8,
//         children: [Applist()],
//       }),
//     }),
//   });

export const agsConf = App.config({
  onConfigParsed: () => {},
  windows: [
    Bar(mon),
    CalendarMenu(mon),
    AudioMenu(mon),
    BrightnessBox(mon),
    AudioBox(mon),
    BatteryBox(mon),
    PowerMenu(mon),
    NetworkMenu(mon),
  ],
  style: css,
});
