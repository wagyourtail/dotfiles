import { Accessor, createBinding, createComputed, With } from "ags"
import { execAsync } from "ags/process"
import { Gtk } from "ags/gtk4"
import Wp from "gi://AstalWp"
import { toggleWindow } from "../lib/utils"
import PopupWindow from "./PopupWindow"
import Media from "./Media"
import VolumeMixer from "./VolumeMixer"

const wp = Wp.get_default()
const audio = wp?.audio
const WINDOW_NAME = "audio"

const VOL_ICONS = [
    [101, "overamplified"],
    [67, "high"],
    [34, "medium"],
    [1, "low"],
    [0, "muted"],
] as const

function volIcon(vol: number, muted: boolean, mic: boolean) {
    const idx = muted ? 0 : (VOL_ICONS.find(([t]) => t <= vol * 100)?.[0] ?? 0)
    const name = VOL_ICONS.find(([t]) => t === idx)?.[1] ?? "muted"
    return mic
        ? `microphone-sensitivity-${name}-symbolic`
        : `audio-volume-${name}-symbolic`
}

/** Speaker volume icon button — toggles the audio menu. */
export function AudioIndicator() {
    const speaker = audio && createBinding(audio, "default_speaker")
    const icon = createComputed(() => {
        const s = speaker?.()
        return s ? volIcon(s.volume, s.mute, false) : "audio-volume-muted-symbolic"
    })
    return (
        <button class="audio" onClicked={() => toggleWindow(WINDOW_NAME)}>
            <image iconName={icon} />
        </button>
    )
}

function EndpointSlider({ endpoint }: { endpoint: Wp.Endpoint }) {
    const mic = endpoint.name?.toLowerCase().includes("mic") ?? false
    return (
        <box class="endpoint" spacing={8}>
            <button
                onClicked={() => (endpoint.mute = !endpoint.mute)}
                tooltipMarkup="toggle mute"
            >
                <image
                    iconName={createComputed(() =>
                        volIcon(
                            createBinding(endpoint, "volume")(),
                            createBinding(endpoint, "mute")(),
                            mic,
                        ),
                    )}
                />
            </button>
            <slider
                hexpand
                value={createBinding(endpoint, "volume")}
                onChangeValue={({ value }) => (endpoint.volume = value)}
            />
        </box>
    )
}

/** Device selector dropdown. AstalWp exposes no default-endpoint setter,
 * so selection shells out to `wpctl set-default <id>`. */
function EndpointPicker({
    endpoints,
    current,
}: {
    endpoints: Accessor<Wp.Endpoint[]>
    current: Accessor<Wp.Endpoint | null>
}) {
    const state = createComputed(() => ({
        eps: endpoints() ?? [],
        def: current()?.id,
    }))
    return (
        <With value={state}>
            {({ eps, def }: { eps: Wp.Endpoint[]; def?: number }) => {
                if (!eps?.length) return <box />
                const model = new Gtk.StringList()
                for (const e of eps) model.append(e.description ?? e.name ?? "unknown")
                const sel = Math.max(
                    0,
                    eps.findIndex((e) => e.id === def),
                )
                return (
                    <Gtk.DropDown
                        class="device-picker"
                        hexpand
                        model={model}
                        selected={sel}
                        onNotifySelected={(dd) => {
                            const ep = eps[dd.selected]
                            if (ep && ep.id !== def) {
                                execAsync(["wpctl", "set-default", String(ep.id)]).catch(print)
                            }
                        }}
                    />
                )
            }}
        </With>
    )
}

export const AudioMenu = (monitor: number) => (
    <PopupWindow name={WINDOW_NAME} monitor={monitor}>
        <box class="audio-menu" orientation={Gtk.Orientation.VERTICAL} spacing={8} widthRequest={340}>
            <With value={audio && createBinding(audio, "default_speaker")}>
                {(speaker) =>
                    speaker && (
                        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                            <label label="Output" xalign={0} class="menu-section" />
                            <EndpointSlider endpoint={speaker as Wp.Endpoint} />
                            <EndpointPicker
                                endpoints={createBinding(audio, "speakers")}
                                current={createBinding(audio, "default_speaker")}
                            />
                        </box>
                    )
                }
            </With>
            <With value={audio && createBinding(audio, "default_microphone")}>
                {(mic) =>
                    mic && (
                        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                            <label label="Input" xalign={0} class="menu-section" />
                            <EndpointSlider endpoint={mic as Wp.Endpoint} />
                            <EndpointPicker
                                endpoints={createBinding(audio, "microphones")}
                                current={createBinding(audio, "default_microphone")}
                            />
                        </box>
                    )
                }
            </With>
            <Media />
            <VolumeMixer />
        </box>
    </PopupWindow>
)
