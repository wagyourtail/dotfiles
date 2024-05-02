import type { Stream } from "types/service/audio";
import Slider from "widgets/Slider";

const audio = await Service.import("audio");
const apps = await Service.import("applications");

const PerAppVolume = (appStream: Stream) => {
  return Widget.Box({
    class_name: "volume-mixer",
    vpack: "center",
    children: [
      Widget.Icon({
        size: 20,
        icon: appStream.icon_name || "",
      }),
      Widget.Box({
        // gtk slider is so painful...
        class_name: "slider-hack",
        vertical: true,
        children: [
          Widget.Label({
            class_name: "volume-mixer-label",
            hpack: "start",
            label: Utils.merge(
              [appStream.bind("name"), appStream.bind("description")],
              (name, desc) => {
                return `${name} - ${desc}`;
              },
            ),
            maxWidthChars: 30,
            truncate: "end",
          }),
          Slider({
            on_change: ({ value }) => {
              appStream.volume = value;
            },
            setup: (w) =>
              w.hook(appStream, () => {
                w.value = appStream.volume || 0;
              }),
          }),
        ],
      }),
      Widget.Label({
        class_name: "volume-label",
        label: appStream.bind("volume").as((v) => `${Math.floor(v * 100)}%`),
      }),
    ],
  });
};

export const VolumeMixer = () => {
  return Widget.Box({
    class_name: "volume-mixer-container",
    vertical: true,
    children: audio.apps.map((appStream) => PerAppVolume(appStream)),
    setup: (w) =>
      w
        .hook(
          audio,
          (w, id) => {
            if (typeof id !== "number") return;
            // console.log(`${id} added`);
            w.children = audio.apps.map((st) => PerAppVolume(st));
          },
          "stream-added",
        )
        .hook(
          audio,
          (w, id) => {
            if (typeof id !== "number") return;
            // console.log(`${id} removed`);
            w.children = audio.apps.map((appStream) => PerAppVolume(appStream));
          },
          "stream-removed",
        ),
  });
};
