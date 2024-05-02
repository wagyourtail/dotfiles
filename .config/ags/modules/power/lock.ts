const WINDOW_NAME = "power";

export const LockIcon = Widget.Box({
  class_name: "power-control-top-icon",
  hpack: "start",
  child: Widget.Icon({
    icon: "system-lock-screen-symbolic",
    size: 24,
  }),
});

export const LockSreenLabel = Widget.Box({
  hpack: "start",
  child: Widget.Label({
    label: "Lock Screen",
    justification: "left",
  }),
});

export const LockScreenShortcutBox = Widget.Box({
  hpack: "end",
  child: Widget.Label({
    label: "Super + Escape",
    justification: "right",
  }),
});

export const Lock = () => {
  return Widget.EventBox({
    class_name: "power-control-top-eb",
    hexpand: true,
    child: Widget.CenterBox({
      class_name: "power-control-top",
      start_widget: Widget.Box({
        children: [LockIcon, LockSreenLabel],
      }),
      end_widget: LockScreenShortcutBox,
    }),
    on_primary_click: () => {
      Utils.execAsync("loginctl lock-session");
      App.toggleWindow(WINDOW_NAME);
    },
  });
};
