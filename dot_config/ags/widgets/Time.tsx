import { createPoll } from "ags/time"
import { toggleWindow } from "../lib/utils"
import PopupWindow from "./PopupWindow"
import Calendar from "./Calendar"

const WINDOW_NAME = "calendar"

const time = createPoll("", 1000, `date +"%D  %-I:%M %p"`)

/** Clock button — toggles the calendar popup. */
export function Time() {
    return (
        <button class="time" onClicked={() => toggleWindow(WINDOW_NAME)}>
            <label label={time} />
        </button>
    )
}

export const CalendarMenu = (monitor: number) => (
    <PopupWindow name={WINDOW_NAME} monitor={monitor}>
        <Calendar />
    </PopupWindow>
)
