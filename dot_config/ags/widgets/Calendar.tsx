import { createComputed, createState, For } from "ags"

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

type Day = { label: string; today: boolean; other: boolean; date: string }
type Week = { id: number; days: Day[] }

/** Month grid — GTK4 has no Gtk.Calendar, so this builds one from boxes. */
export default function Calendar() {
    const now = new Date()
    const [year, setYear] = createState(now.getFullYear())
    const [month, setMonth] = createState(now.getMonth())

    function shift(delta: number) {
        let y = year()
        let m = month() + delta
        if (m < 0) { m = 11; y-- }
        if (m > 11) { m = 0; y++ }
        setYear(y)
        setMonth(m)
    }

    const weeks = createComputed((): Week[] => {
        const y = year()
        const m = month()
        const firstDow = new Date(y, m, 1).getDay()
        const count = new Date(y, m + 1, 0).getDate()
        const prevCount = new Date(y, m, 0).getDate()
        const isCurrent = y === now.getFullYear() && m === now.getMonth()
        const prevM = m === 0 ? 11 : m - 1
        const prevY = m === 0 ? y - 1 : y
        const nextM = m === 11 ? 0 : m + 1
        const nextY = m === 11 ? y + 1 : y
        const ymd = (yy: number, mm: number, d: number) => `${yy}.${mm + 1}.${d}`

        const days: Day[] = []
        for (let i = firstDow - 1; i >= 0; i--)
            days.push({ label: `${prevCount - i}`, today: false, other: true, date: ymd(prevY, prevM, prevCount - i) })
        for (let d = 1; d <= count; d++)
            days.push({ label: `${d}`, today: isCurrent && d === now.getDate(), other: false, date: ymd(y, m, d) })
        for (let d = 1; days.length % 7 !== 0; d++)
            days.push({ label: `${d}`, today: false, other: true, date: ymd(nextY, nextM, d) })

        const out: Week[] = []
        for (let w = 0; w < days.length / 7; w++)
            out.push({ id: w, days: days.slice(w * 7, w * 7 + 7) })
        return out
    })

    return (
        <box class="calendar" orientation="vertical" spacing={4}>
            <centerbox>
                <button $type="start" onClicked={() => shift(-1)}>
                    <label label="‹" />
                </button>
                <label
                    $type="center"
                    class="calendar-header"
                    label={createComputed(() => `${MONTHS[month()]} ${year()}`)}
                />
                <button $type="end" onClicked={() => shift(1)}>
                    <label label="›" />
                </button>
            </centerbox>
            <box class="calendar-week" homogeneous>
                {WEEKDAYS.map((d) => (
                    <label class="calendar-weekday" label={d} />
                ))}
            </box>
            <For each={weeks}>
                {(week) => (
                    <box class="calendar-week" homogeneous>
                        {week.days.map((day) => (
                            <button
                                class={day.today ? "today" : day.other ? "other-month" : ""}
                                onClicked={() => print(day.date)}
                            >
                                <label label={day.label} />
                            </button>
                        ))}
                    </box>
                )}
            </For>
        </box>
    )
}
