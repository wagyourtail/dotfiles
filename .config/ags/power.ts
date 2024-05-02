import { Lock } from "modules/power/lock";
import { Logout } from "modules/power/logout";
import { Restart } from "modules/power/restart";
import { Shutdown } from "modules/power/shutdown";
import { Suspend } from "modules/power/suspend";
import PopupWindow from "widgets/PopupWindow";

const WINDOW_NAME = "power";

const PowerContainer = () => {
  return Widget.Box({
    class_name: "power-control",
    css: "min-width: 400px",
    vertical: true,
    children: [
      Widget.Box({
        vertical: true,
        children: [Lock(), Logout()],
      }),
      Widget.CenterBox({
        start_widget: Suspend(),
        center_widget: Restart(),
        end_widget: Shutdown(),
      }),
    ],
  });
};

export function PowerMenu(monitor = 0) {
  return PopupWindow({
    monitor,
    name: WINDOW_NAME,
    exclusivity: "exclusive",
    transition: "none",
    layout: "top-right",
    child: PowerContainer(),
  });
}

export function Power() {
  const icon = "system-shutdown-symbolic";

  return Widget.Button({
    class_name: WINDOW_NAME,
    child: Widget.Icon(icon),
    on_clicked: () => App.toggleWindow(WINDOW_NAME),
  });
}
