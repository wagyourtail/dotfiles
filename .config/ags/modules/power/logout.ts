const WINDOW_NAME = "power";

export const LogoutIcon = Widget.Box({
  class_name: "power-control-top-icon",
  hpack: "start",
  child: Widget.Icon({
    icon: "system-log-out-symbolic",
    size: 24,
  }),
});

export const LogoutLabel = Widget.Box({
  hpack: "start",
  child: Widget.Label({
    label: "Log Out",
    justification: "left",
  }),
});

export const LogoutShortcutBox = Widget.Box({
  hpack: "end",
  child: Widget.Label({
    label: "Ctrl + Alt + Escape",
    justification: "right",
  }),
});

export const Logout = () => {
  return Widget.EventBox({
    class_name: "power-control-top-eb",
    hexpand: true,
    child: Widget.CenterBox({
      class_name: "power-control-top",
      start_widget: Widget.Box([LogoutIcon, LogoutLabel]),
      end_widget: LogoutShortcutBox,
    }),
    on_primary_click: () => {
      Utils.execAsync("hyprctl dispatch exit");
      App.toggleWindow(WINDOW_NAME);
    },
  });
};
