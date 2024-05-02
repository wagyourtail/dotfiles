import { Button } from "types/@girs/gtk-3.0/gtk-3.0.cjs";
import type { Client } from "types/service/hyprland";
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
  const workspaces = hyprland.workspaces.filter((ws) => ws.monitorID === monitor).sort((a, b) => a.id - b.id);
  self.children = workspaces.map((ws, i) => {
    let button = Widget.Button({
      attribute: ws.id,
      label: `${ws.name == ws.id.toString() ? i + 1 : ws.name}`,
      onClicked: () => dispatch(ws.id),
      setup: (w) =>
        w.hook(hyprland, () => {
          const active = activeWs?.id == ws.id;
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
      const active = activeWs?.id == ws.id;
      const wsWindowCount = ws?.windows || 0;
      const occupied = wsWindowCount > 0 && !active;
      const cns: string[] = [];
      if (active) {
        cns.push("focused");
      } else if (occupied) {
        cns.push("occupied");
      }
      button.class_names = cns;
      return button;
    }
  );
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
