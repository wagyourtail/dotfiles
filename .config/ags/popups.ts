import brightness from "services/brightness";
import GLib from "types/@girs/glib-2.0/glib-2.0";
import PopupWindow from "widgets/PopupWindow";
import Slider from "widgets/Slider";

const audio = await Service.import("audio");

const BRIGHTNESS_WINDOW_NAME = "brightness-popup";
const AUDIO_WINDOW_NAME = "audio-popup";

function BrightnessSlider() {
    return Slider({
      on_change: (self) => {
        brightness.screen_value = self.value;
      },
      value: brightness.bind("screen_value"),
    });
  }
  
  
  let timeout: GLib.Source | null = null;
  
  brightness.connect("screen-changed", (v) => {
    App.openWindow(BRIGHTNESS_WINDOW_NAME);
    if (timeout != null) clearTimeout(timeout);
    timeout = setTimeout(() => App.closeWindow(BRIGHTNESS_WINDOW_NAME), 2000);
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

function AudioSlider() {
    return Slider({
      on_change: ({ value }) => (audio.speaker.volume = value),
      value: audio.speaker.bind("volume"),
    });
  }

let audioTimeout: GLib.Source | null = null;
let oldVolume = audio.speaker.is_muted ? 0 : audio.speaker.volume;

audio.speaker.connect("changed", () => {
    let newVolume = audio.speaker.is_muted ? 0 : audio.speaker.volume;
    if (newVolume == oldVolume) return;
    oldVolume = newVolume;
    App.openWindow(AUDIO_WINDOW_NAME);
    if (audioTimeout != null) clearTimeout(audioTimeout);
    audioTimeout = setTimeout(() => App.closeWindow(AUDIO_WINDOW_NAME), 2000);
});

function AudioIcon() {
    const speakerVol = audio.speaker.bind("volume");
    const mutedState = audio.speaker.bind("is_muted");

    return Widget.Icon({
        icon: Utils.merge([speakerVol, mutedState], (v, m) => {
            const vol = m ? 0 : v * 100;
            const icon = [
                [101, 'overamplified'],
                [67, 'high'],
                [34, 'medium'],
                [1, 'low'],
                [0, 'muted'],
            ].find(([threshold]) => <number>threshold <= vol)?.[1];
            return `audio-volume-${icon}-symbolic`;
        }),
        size: 64,
    });
}

export const AudioBox = (monitor = 0) => 
    PopupWindow({
      monitor,
      name: AUDIO_WINDOW_NAME,
      exclusivity: "exclusive",
      transition: "none",
      layout: "center",
      child: Widget.Box({
        css: "min-width: 180px;",
        vertical: true,
        margin: 16,
        children: [
           AudioIcon(),
           Widget.Box({
            css: "min-height: 16px;"
           }),
           Widget.Box({
            children: [
              AudioSlider(),
              Widget.Label({
                label: audio.speaker.bind("volume").as((v) => `${Math.floor(v * 100)}%`),
              })
            ]
           })
        ]
      }),
    });