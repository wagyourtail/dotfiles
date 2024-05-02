import { PANEL_MARGIN_Y } from "main";
import { Media } from "media";
import { VolumeMixer } from "modules/audio/volume-mixer";
import Divider from "widgets/Divider";
import PopupWindow from "widgets/PopupWindow";
import Slider from "widgets/Slider";

const audio = await Service.import("audio");
const mpris = await Service.import("mpris");
const players = mpris.bind("players");

const WINDOW_NAME = "audio";

const icons = {
  101: "overamplified",
  67: "high",
  34: "medium",
  1: "low",
  0: "muted",
};

function getIcon(type: "speaker" | "mic") {
  const speakerVolumeBind = audio.speaker.bind("volume");
  const speakerMuteBind = audio.speaker.bind("is_muted");

  const micVolumeBind = audio.microphone.bind("volume");
  const micMuteBind = audio.microphone.bind("is_muted");

  if (type === "speaker") {
    return Utils.merge(
      [speakerVolumeBind, speakerMuteBind],
      (volume, is_muted) => {
        const idx = is_muted
          ? 0
          : [101, 67, 34, 1, 0].find(
              (threshold) => threshold <= volume * 100,
            ) || 0;

        return `audio-volume-${icons[idx]}-symbolic`;
      },
    );
  } else {
    return Utils.merge([micVolumeBind, micMuteBind], (volume, is_muted) => {
      const idx = is_muted
        ? 0
        : [101, 67, 34, 1, 0].find((threshold) => threshold <= volume * 100) ||
          0;

      return `microphone-sensitivity-${icons[idx]}-symbolic`;
    });
  }
}

export const SpeakerIcon = (size?: number) =>
  Widget.Icon({
    icon: getIcon("speaker"),
    size: size || 18,
  });

export const MicIcon = (size?: number) =>
  Widget.Icon({
    icon: getIcon("mic"),
    size: size || 18,
  });

const AudioContainer = () => {
  function SpeakerSlider() {
    return Slider({
      on_change: ({ value }) => {
        audio.speaker.volume = value;
      },
      setup: (self) =>
        self.hook(audio.speaker, () => {
          self.value = audio.speaker.volume || 0;
        }),
    });
  }

  const SpeakerLabel = () =>
    Widget.Label({
      class_name: "volume-label",
      label: audio.speaker.bind("volume").as((v) => `${Math.floor(v * 100)}%`),
    });

  function MicSlider() {
    return Widget.Slider({
      css: `
                min-width: 4px;
                min-height: 4px;
            `,
      hexpand: true,
      draw_value: false,
      on_change: ({ value }) => (audio.microphone.volume = value),
      setup: (self) =>
        self.hook(audio.microphone, () => {
          self.value = audio.microphone.volume || 0;
        }),
    });
  }

  const MicLabel = () =>
    Widget.Label({
      class_name: "volume-label",
      label: audio.microphone
        .bind("volume")
        .as((v) => `${Math.floor(v * 100)}%`),
    });

  return Widget.Box({
    css: "min-width: 400px",
    class_name: `${WINDOW_NAME}-popup`,
    vertical: true,
    children: [
      Widget.Box({
        class_name: "volume-container",
        vertical: true,
        children: [
          Widget.Box({
            hexpand: true,
            children: [SpeakerIcon(20), SpeakerSlider(), SpeakerLabel()],
          }),
          Widget.Box({
            hexpand: true,
            children: [MicIcon(20), MicSlider(), MicLabel()],
          }),
        ],
      }),
      Divider({
        visible: players.as((p) => p.length > 0),
      }),
      Media(),
      Divider({
        visible: audio.bind("apps").as((sts) => sts.length > 0),
      }),
      VolumeMixer(),
    ],
  });
};

export function AudioMenu(monitor = 0) {
  return PopupWindow({
    monitor,
    name: WINDOW_NAME,
    exclusivity: "exclusive",
    transition: "none",
    layout: "top-right",
    child: AudioContainer(),
  });
}

export function Audio() {
  return Widget.Button({
    class_name: `${WINDOW_NAME}-btn`,
    child: SpeakerIcon(),
    on_clicked: () => App.toggleWindow(WINDOW_NAME),
  });
}
