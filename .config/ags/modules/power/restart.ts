import { POWER_BOTTOM_ICON_SIZE } from "./index";

const WINDOW_NAME = "power";

export const RestartIcon = Widget.Box({
  hpack: "center",
  child: Widget.Icon({
    icon: "system-restart-symbolic",
    size: POWER_BOTTOM_ICON_SIZE,
  }),
});

export const RestartLabel = Widget.Box({
  hpack: "center",
  child: Widget.Label({
    label: "Restart",
  }),
});

export const Restart = () => {
  return Widget.Box(
    {},
    Widget.EventBox({
      class_name: "power-control-bottom-eb",
      child: Widget.Box({
        class_name: "power-control-bottom",
        vertical: true,
        children: [RestartIcon, RestartLabel],
      }),
      on_primary_click: () => {
        Utils.execAsync("systemctl reboot");
        App.toggleWindow(WINDOW_NAME);
      },
    }),
  );
};
