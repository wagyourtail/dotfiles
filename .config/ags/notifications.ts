import PopupWindow from "widgets/PopupWindow";

const cmdStr = `swaync-client -s`;
const notifications = Variable("", {
  listen: cmdStr,
}).bind().as(p => JSON.parse(p));

export function Notifications() {
  return Widget.Button({
      class_name: "notifications-btn",
      image: Widget.Icon("preferences-system-notifications-symbolic"),
      label: notifications.as(p => p.count.toString()),
      on_clicked: () => Utils.exec("swaync-client --toggle-panel"),
      always_show_image: true,
    });
}
