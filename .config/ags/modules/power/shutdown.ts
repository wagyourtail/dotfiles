import { POWER_BOTTOM_ICON_SIZE } from "./index";

const WINDOW_NAME = "power";

export const ShutdownIcon = Widget.Box({
  hpack: "center",
  child: Widget.Icon({
    icon: "system-shutdown-symbolic",
    size: POWER_BOTTOM_ICON_SIZE,
  }),
});

export const ShutdownLabel = Widget.Box({
  hpack: "center",
  child: Widget.Label({
    label: "Shutdown",
  }),
});

export const Shutdown = () => {
  return Widget.Box(
    {
      hpack: "end",
    },
    Widget.EventBox({
      class_name: "power-control-bottom-eb",
      child: Widget.Box({
        class_name: "power-control-bottom",
        vertical: true,
        children: [ShutdownIcon, ShutdownLabel],
      }),
      on_primary_click: () => {
        Utils.execAsync("systemctl poweroff");
        App.toggleWindow(WINDOW_NAME);
      },
    }),
  );
};
