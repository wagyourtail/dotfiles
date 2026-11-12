import { createBinding, For } from "ags"
import Wp from "gi://AstalWp"

/** Per-application playback stream volume sliders. */
export default function VolumeMixer() {
    const audio = Wp.get_default()?.audio
    if (!audio) return <box />

    const streams = createBinding(audio, "streams")

    return (
        <box class="volume-mixer" vertical visible={streams((s) => s.length > 0)}>
            <label class="volume-mixer-header" label="Applications" xalign={0} />
            <For each={streams}>
                {(stream: Wp.Stream) => (
                    <box class="mixer-stream" spacing={8}>
                        <image iconName={createBinding(stream, "icon")} />
                        <box vertical hexpand>
                            <label
                                label={createBinding(stream, "name")((n) => n ?? "")}
                                xalign={0}
                                maxWidthChars={28}
                            />
                            <slider
                                value={createBinding(stream, "volume")}
                                onChangeValue={({ value }) => (stream.volume = value)}
                            />
                        </box>
                    </box>
                )}
            </For>
        </box>
    )
}
