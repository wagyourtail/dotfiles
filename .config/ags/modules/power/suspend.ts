import { POWER_BOTTOM_ICON_SIZE } from "./index";

const WINDOW_NAME = "power";

export const SuspendIcon = Widget.Box({
  hpack: "center",
  child: Widget.Icon({
    icon: "system-suspend-symbolic",
    size: POWER_BOTTOM_ICON_SIZE,
  }),
});

export const SuspendLabel = Widget.Box({
  hpack: "center",
  child: Widget.Label({
    label: "Suspend",
  }),
});

export const Suspend = () => {
  return Widget.Box(
    {},
    Widget.EventBox({
      class_name: "power-control-bottom-eb",
      child: Widget.Box({
        class_name: "power-control-bottom",
        vertical: true,
        children: [SuspendIcon, SuspendLabel],
      }),
      on_primary_click: () => {
        Utils.execAsync("systemctl suspend");
        App.toggleWindow(WINDOW_NAME);
      },
    }),
  );
};
