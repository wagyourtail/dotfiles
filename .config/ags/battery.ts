import { PANEL_MARGIN_Y } from "main";
import brightness from "services/brightness";
import GLib from "types/@girs/glib-2.0/glib-2.0";
import PopupWindow from "widgets/PopupWindow";
import Slider from "widgets/Slider";

const battery = await Service.import("battery");

const WINDOW_NAME = "battery";
const BRIGHTNESS_WINDOW_NAME = "brightness";

const iconMap = {
  100: "full",
  67: "good",
  34: "caution",
  9: "low",
  5: "empty",
};

function getIcon() {
  const chargingBind = battery.bind("charging");
  const percentBind = battery.bind("percent");

  const icon = Utils.merge([chargingBind, percentBind], (ch, p) => {
    const charging = ch ? "-charging" : "";

    const idx =
      Object.keys(iconMap)
        .map((str) => Number(str))
        .sort((a, b) => b - a)
        .find((thres) => thres <= battery.percent) || 0;

    return `battery-${iconMap[idx]}${charging}-symbolic`;
  });

  return icon;
}

function getTooltip() {
  const chargingBind = battery.bind("charging");
  const timeRemain = battery.bind("time_remaining");

  return Utils.merge([chargingBind, timeRemain], (ch, t) => {
    const charging = ch ? "Charging" : "Discharging";
    return `${charging}\n${formatTime(t)} Remaining`;
  });
}

export const BatteryBox = (monitor = 0) =>
  Widget.Window({
    monitor,
    name: WINDOW_NAME,
    anchor: ["top", "right"],
    exclusivity: "ignore",
    keymode: "none",
    layer: "overlay",
    margins: [PANEL_MARGIN_Y, 45],
    child: Widget.Box({
      css: "min-width: 180px",
      child: BrightnessSlider(),
    }),
    visible: false,
  });

export const BrightnessBox = (monitor = 0) => 
  PopupWindow({
    monitor,
    name: BRIGHTNESS_WINDOW_NAME,
    exclusivity: "exclusive",
    transition: "none",
    layout: "center",
    child: Widget.Box({
      css: "min-width: 180px;",
      vertical: true,
      margin: 16,
      children: [
        Widget.Icon({ 
          icon: "display-brightness-symbolic",
          size: 64
         }),
         Widget.Box({
          css: "min-height: 16px;"
         }),
         Widget.Box({
          children: [
            BrightnessSlider(),
            Widget.Label({
              label: brightness.bind("screen_value").as((v) => `${Math.floor(v * 100)}%`),
            })
          ]
         })
      ]
    }),
  });


let timeout: GLib.Source | null = null;

brightness.connect("screen-changed", (v) => {
  App.openWindow(BRIGHTNESS_WINDOW_NAME);
  if (timeout != null) clearTimeout(timeout);
  timeout = setTimeout(() => App.closeWindow(BRIGHTNESS_WINDOW_NAME), 2000);

});

function BrightnessSlider() {
  return Slider({
    on_change: (self) => {
      brightness.screen_value = self.value;
    },
    value: brightness.bind("screen_value"),
  });
}

// format time in seconds as HH:MM
function formatTime(time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

export function Battery() {
  return Widget.Button({
    class_name: WINDOW_NAME,
    image: Widget.Icon({ icon: getIcon() }),
    tooltipText: getTooltip(),
    label: battery.bind("percent").as((p) => `${p}%`),
    on_clicked: () => App.toggleWindow(WINDOW_NAME),
  });
}
