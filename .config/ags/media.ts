import type { MprisPlayer } from "types/service/mpris";

const mpris = await Service.import("mpris");

const players = mpris.bind("players");

const FALLBACK_ICON = "audio-x-generic-symbolic";
const PLAY_ICON = "media-playback-start-symbolic";
const PAUSE_ICON = "media-playback-pause-symbolic";
const PREV_ICON = "media-skip-backward-symbolic";
const NEXT_ICON = "media-skip-forward-symbolic";
export const PLAYER_ICON_SIZE = 16;

function Player(player: MprisPlayer) {
  const img = Widget.Box({
    class_name: "img",
    vpack: "center",
    css: player.bind("track_cover_url").transform((p) => {
      const artist_fallback = `file://${App.configDir}/res/artist_fallback.png`;
      return `background-image: url("${p === "" ? artist_fallback : p}");`;
    }),
  });

  const title = Widget.Label({
    class_name: "title",
    hpack: "start",
    label: player.bind("track_title"),
    maxWidthChars: 20,
    truncate: "end",
  });

  const artist = Widget.Label({
    class_name: "artist",
    hpack: "start",
    label: player.bind("track_artists").transform((a) => a.join(", ")),
    maxWidthChars: 20,
    truncate: "end",
  });

  const playPause = Widget.Button({
    class_name: "play-pause",
    on_clicked: () => player.playPause(),
    visible: player.bind("can_play"),
    child: Widget.Icon({
      icon: player.bind("play_back_status").transform((s) => {
        switch (s) {
          case "Playing":
            return PAUSE_ICON;
          case "Paused":
          case "Stopped":
            return PLAY_ICON;
        }
      }),
      size: PLAYER_ICON_SIZE,
    }),
  });

  const prev = Widget.Button({
    on_clicked: () => player.previous(),
    visible: player.bind("can_go_prev"),
    child: Widget.Icon({
      icon: PREV_ICON,
      size: PLAYER_ICON_SIZE,
    }),
  });

  const next = Widget.Button({
    on_clicked: () => player.next(),
    visible: player.bind("can_go_next"),
    child: Widget.Icon({
      icon: NEXT_ICON,
      size: PLAYER_ICON_SIZE,
    }),
  });

  return Widget.Box(
    {
      class_name: "player",
      vertical: true,
    },
    Widget.Box(
      {
        hexpand: true,
        vpack: "center",
      },
      Widget.Box({
        vpack: "center",
        children: [
          img,
          Widget.Box({
            vertical: true,
            hexpand: true,
            vpack: "center",
            children: [title, artist],
          }),
          Widget.Box({
            vpack: "center",
            children: [prev, playPause, next],
          }),
        ],
      }),
    ),
  );
}

export function Media() {
  return Widget.Box({
    class_name: "media",
    vertical: true,
    css: "min-height: 2px; min-width: 2px;", // small hack to make it visible
    visible: players.as((p) => p.length > 0),
    children: players.as((p) => p.map(Player)),
  });
}
