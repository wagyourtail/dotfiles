import type { TrayItem } from "types/service/systemtray";

const systemtray = await Service.import("systemtray");

const SysTrayItem = (item: TrayItem) =>
	Widget.Button({
		class_name: "systray-item",
		child: Widget.Icon().bind("icon", item, "icon"),
		tooltipMarkup: item.bind("tooltip_markup"),
		onPrimaryClick: (_, event) => item.activate(event),
		onSecondaryClick: (_, event) => item.openMenu(event),
	});

export const sysTray = Widget.Box({
	class_name: "systray",
	children: systemtray.bind("items").as((i) => i.map(SysTrayItem)),
});
