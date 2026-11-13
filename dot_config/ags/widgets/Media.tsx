import { createBinding, For } from "ags"
import { Gtk } from "ags/gtk4"
import Mpris from "gi://AstalMpris"

const mpris = Mpris.get_default()
const ART = `${SRC}/res/artist_fallback.png`

const STATUS_ICON = {
    [Mpris.PlaybackStatus.PLAYING]: "media-playback-pause-symbolic",
    [Mpris.PlaybackStatus.PAUSED]: "media-playback-start-symbolic",
    [Mpris.PlaybackStatus.STOPPED]: "media-playback-start-symbolic",
}

/** Mpris players as cards: cover art, title/artist/album, transport row. */
export default function Media() {
    const players = createBinding(mpris, "players")

    return (
        <box class="media" orientation={Gtk.Orientation.VERTICAL} spacing={6} visible={players((p) => p.length > 0)}>
            <For each={players}>
                {(player: Mpris.Player) => (
                    <box class="media-player" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
                        <box spacing={10}>
                            <image
                                class="media-cover"
                                file={createBinding(player, "cover_art")((c) => c || ART)}
                                pixelSize={56}
                            />
                            <box orientation={Gtk.Orientation.VERTICAL} hexpand valign={Gtk.Align.CENTER}>
                                <label
                                    class="media-title"
                                    label={createBinding(player, "title")((t) => t ?? "Unknown")}
                                    xalign={0}
                                    maxWidthChars={26}
                                />
                                <label
                                    class="media-artist"
                                    label={createBinding(player, "artist")((a) => a ?? "")}
                                    xalign={0}
                                    maxWidthChars={26}
                                />
                                <label
                                    class="media-album"
                                    label={createBinding(player, "album")((a) => a ?? "")}
                                    xalign={0}
                                    maxWidthChars={26}
                                    visible={createBinding(player, "album")((a) => Boolean(a))}
                                />
                            </box>
                        </box>
                        <box class="media-controls" halign={Gtk.Align.CENTER} spacing={6}>
                            <button onClicked={() => player.previous()}>
                                <image iconName="media-skip-backward-symbolic" />
                            </button>
                            <button class="media-play" onClicked={() => player.play_pause()}>
                                <image
                                    iconName={createBinding(
                                        player,
                                        "playback_status",
                                    )((s) => STATUS_ICON[s] ?? "media-playback-start-symbolic")}
                                />
                            </button>
                            <button onClicked={() => player.next()}>
                                <image iconName="media-skip-forward-symbolic" />
                            </button>
                        </box>
                    </box>
                )}
            </For>
        </box>
    )
}
