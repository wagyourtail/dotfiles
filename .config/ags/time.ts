import PopupWindow from "widgets/PopupWindow";

const WINDOW_NAME = "calendar";

const cmdStr = `date +"%D  %-I:%M %p"`;
const time = Variable("", {
  poll: [1000, cmdStr],
});

const calendar = Widget.Calendar({
  class_name: "calendar",
  showDayNames: true,
  showDetails: true,
  showHeading: true,
  showWeekNumbers: true,
  onDaySelected: ({ date: [y, m, d] }) => {
    print(`${y}. ${m}. ${d}.`);
  },
});

export const CalendarMenu = (monitor = 0) =>
  PopupWindow({
    monitor,
    name: WINDOW_NAME,
    exclusivity: "exclusive",
    transition: "none",
    layout: "top-right",
    child: calendar,
  });

export function Time() {
  return Widget.Button({
    class_name: "time",
    label: time.bind(),
    on_clicked: () => App.toggleWindow(WINDOW_NAME),
  });
}
