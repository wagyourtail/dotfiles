import { PANEL_MARGIN_Y } from "main";
import brightness from "services/brightness";
import Slider from "widgets/Slider";

const battery = await Service.import("battery");

const WINDOW_NAME = "battery";

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

const icon = Widget.Icon({ icon: getIcon() });

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

function BrightnessSlider() {
  return Slider({
    on_change: (self) => {
      brightness.screen_value = self.value;
    },
    value: brightness.bind("screen_value"),
  });
}

export function Battery() {
  const tooltip = Widget.Label(`${battery.bind("percent")}`);

  return Widget.Button({
    class_name: WINDOW_NAME,
    child: icon,
    on_clicked: () => App.toggleWindow(WINDOW_NAME),
  });
}
