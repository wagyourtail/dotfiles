import { Button } from "types/@girs/gtk-3.0/gtk-3.0.cjs";
import type { Client, Workspace } from "types/service/hyprland";
import Box from "types/widgets/box";

const hyprland = await Service.import("hyprland");

const getActiveWindow = () => {
  const msg = hyprland.message("j/activewindow");
  const res = JSON.parse(msg) as Client | undefined;

  return res;
};

const TitleLabel = (label?: string) => {
  return Widget.Label({
    label,
    visible: label ? true : false,
    maxWidthChars: 100,
    truncate: "end",
  });
};

export function Title() {
  const client = getActiveWindow();
  return Widget.Box(
    {
      class_name: "focused-title",
      setup: (w) =>
        w.hook(hyprland, (w) => {
          const client = getActiveWindow();
          w.child = TitleLabel(client?.title);

          w.toggleClassName("fullscreen", client?.fullscreen || false);
        }),
    },
    TitleLabel(client?.title),
  );
}

const dispatch = (ws: string | number) =>
  hyprland.messageAsync(`dispatch workspace ${ws}`);

function updateWorkspaces(self: Box<Button, unknown>) {
  let activeWs = hyprland.getWorkspace(hyprland.active.workspace.id);
  const monitor = activeWs?.monitorID;
  const workspaces = hyprland.workspaces.sort((a, b) => b.id - a.id);
  const out: Button[] = [];
  const lastId = workspaces.find((ws) => ws.monitorID == monitor)?.id ?? 1;
  const wsMap = new Map<number, Workspace>();
  workspaces.forEach((ws) => wsMap.set(ws.id, ws));
  let i = 1;
  for (let id = 1; id <= lastId; id++) {
    const ws = wsMap.get(id);
    if (ws == undefined || ws?.monitorID == monitor) {
      let button = Widget.Button({
        attribute: id,
        label: `${ws == undefined || ws?.name == id.toString() ? i++ : ws?.name}`,
        onClicked: () => dispatch(id),
        setup: (w) =>
          w.hook(hyprland, () => {
            const active = activeWs?.id == id;
            const wsWindowCount = ws?.windows || 0;
            const occupied = wsWindowCount > 0 && !active;

            const cns: string[] = [];
            if (active) {
              cns.push("focused");
            } else if (occupied) {
              cns.push("occupied");
            }

            w.class_names = cns;
          })
      });
      const active = activeWs?.id == id;
      const wsWindowCount = ws?.windows || 0;
      const occupied = wsWindowCount > 0 && !active;
      const cns: string[] = [];
      if (active) {
        cns.push("focused");
      } else if (occupied) {
        cns.push("occupied");
      }
      button.class_names = cns;
      out.push(button);
    }
  }

  self.children = out;
}

export function Workspaces() {
  const box = Widget.Box({
    children: [] as Button[],
    setup: (self) =>
      self.hook(hyprland, () => {
          updateWorkspaces(self);
      }),
  });
  updateWorkspaces(box);
  return Widget.EventBox({
    class_name: "workspaces",
    onScrollUp: () => {
      dispatch("r-1")
    },
    onScrollDown: () => {
      dispatch("r+1")
    },
    child: box,
  });
}
