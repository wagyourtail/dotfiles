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

/** Mpris players: cover, title/artist, prev/play-pause/next. */
export default function Media() {
    const players = createBinding(mpris, "players")

    return (
        <box class="media" orientation={Gtk.Orientation.Vertical} visible={players((p) => p.length > 0)}>
            <For each={players}>
                {(player: Mpris.Player) => (
                    <box class="media-player" spacing={8}>
                        <image
                            class="media-cover"
                            file={createBinding(player, "cover_art")((c) => c || ART)}
                            pixelSize={48}
                        />
                        <box orientation={Gtk.Orientation.Vertical} hexpand>
                            <label
                                class="media-title"
                                label={createBinding(player, "title")((t) => t ?? "Unknown")}
                                xalign={0}
                                maxWidthChars={24}
                            />
                            <label
                                class="media-artist"
                                label={createBinding(player, "artist")((a) => a ?? "")}
                                xalign={0}
                                maxWidthChars={24}
                            />
                        </box>
                        <box valign={Gtk.Align.CENTER} class="media-controls">
                            <button onClicked={() => player.previous()}>
                                <image iconName="media-skip-backward-symbolic" />
                            </button>
                            <button onClicked={() => player.play_pause()}>
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
