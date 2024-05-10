import PopupWindow from "widgets/PopupWindow";

const network = await Service.import("network");

const WINDOW_NAME = "network";

const connectivityMap = {
  "unknown": "no-route",
  "none": "disconnected",
  "limited": "no-route",
  "portal": ""
}

function getIcon() {
  const primary = network.bind("primary");
  const wired_icon = network.wired.bind("icon_name");
  const wifi_icon = network.wifi.bind("icon_name");
  
  const icon = Utils.merge([primary, wired_icon, wifi_icon], (p, wired, wifi) => {
    if (p == "wired") {
      return wired;
    } else {
      return wifi;
    }
  });

  return icon;
}
 
function getTooltip() {
  const primary = network.bind("primary");
  const wifi_ssid = network.wifi.bind("ssid");
  const wired_state = network.wired.bind("internet");

  const tooltip = Utils.merge([primary, wifi_ssid, wired_state], (p, ssid, state) => {
    if (p == "wired") {
      return state;
    } else {
      return ssid || "No network";
    }
  });

  return tooltip;
}

const icon = Widget.Icon({ icon: getIcon() });

export const NetworkMenu = (monitor = 0) =>
  PopupWindow({
    monitor,
    name: WINDOW_NAME,
    exclusivity: "exclusive",
    transition: "none",
    layout: "top-right",
    child: Widget.Box({
      class_name: "network-menu",
      children: [
        Widget.Label({
          label: network.bind("primary").as((p) => p == "wired" ? "Wired" : "Wireless"),
        }),
      ],
    }),
  });

export function Network() {
  return Widget.Button({
    class_name: "time",
    child: icon,
    tooltipText: getTooltip(),
    on_clicked: () => App.toggleWindow(WINDOW_NAME),
  });
}
