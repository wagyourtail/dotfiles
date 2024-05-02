import type Gtk from "types/@girs/gtk-3.0/gtk-3.0";
import type { Client } from "types/service/hyprland";
import type Box from "types/widgets/box";
import type EventBox from "types/widgets/eventbox";
import { launchApp } from "utils";

const hyprland = await Service.import("hyprland");
const apps = await Service.import("applications");

const focus = (address: string) =>
  hyprland.messageAsync(`dispatch focuswindow address:${address}`);

const getActiveWindow = () => {
  const msg = hyprland.message("j/activewindow");
  const res = JSON.parse(msg) as Client | undefined;

  return res;
};

function groupClients(clients: Client[]) {
  const kv: Map<string, string[]> = new Map();
  for (const client of clients) {
    const addresses = kv.get(client.class);
    if (!addresses) {
      kv.set(client.class, [client.address]);
    } else {
      kv.set(client.class, [...addresses, client.address]);
    }
  }
  return kv;
}

function calculateNextIdx(idx: number, length: number) {
  return (prevClientClass: string, currClientClass: string) => {
    // console.log(prevClientClass + ' ' + currClientClass + ' ' + idx)

    if (prevClientClass.length === 0) {
      return idx;
    }

    if (prevClientClass.length !== 0 && prevClientClass !== currClientClass) {
      return idx;
    }

    if (idx + 1 < length) {
      return idx + 1;
    }
    return 0;
  };
}

const AppItem = (clientClass: string, addresses: string[]) => {
  const app = apps.list.find((app) => app.match(clientClass));
  let activeIdx = 0;

  const btn = Widget.Button({
    class_name: "panel-button",
    on_primary_click: () => {
      // console.log(currentIdx)
      const prevClientClass = hyprland.active.client.class;

      if (!addresses.length) {
        app && launchApp(app);
      } else {
        const nextIdx = calculateNextIdx(activeIdx, addresses.length);
        activeIdx = nextIdx(prevClientClass, clientClass);
        focus(addresses[activeIdx]);
      }
    },
    child: Widget.Icon({
      size: 44,
      icon: app?.icon_name || clientClass,
    }),
  });

  const indicators = addresses.map(() =>
    Widget.Box({
      class_name: "indicator",
    }),
  );

  const itemBox = Widget.Box(
    {
      class_name: "panel-item-box",
      attribute: {
        clientClass,
        addresses,
      },
      setup: (w) =>
        w
          .hook(
            hyprland,
            (w, name, data) => {
              switch (name) {
                case "activewindowv2": {
                  // sync the focus from hyprland
                  if (typeof data !== "string") return;

                  const address = `0x${data}`;
                  const idx = addresses.findIndex((a) => a === address);
                  if (idx !== -1) activeIdx = idx;

                  break;
                }
                default:
                  break;
              }
            },
            "event",
          )
          .hook(hyprland, (w) => {
            /**
             * Can't do async here for some reason? Race condition?
             */
            const client = getActiveWindow();
            const isActiveItem = clientClass === client?.class;

            w.toggleClassName("active", isActiveItem);
            w.toggleClassName("fullscreen", isActiveItem && client?.fullscreen);
          }),
    },
    Widget.Box({
      vertical: true,
      children: [
        btn,
        Widget.Box({
          spacing: 6,
          hpack: "center",
          children: indicators,
        }),
      ],
    }),
  );

  return Widget.EventBox(
    {
      class_name: "panel-item",
      margin_left: 6,
      attribute: {
        clientClass,
        addresses,
      },
    },
    itemBox,
  );
};

export const Applist = () => {
  const clientEntries = groupClients(hyprland.clients).entries();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const AppItems: any[] = [];

  for (const [clientClass, clientAddresses] of clientEntries) {
    AppItems.push(AppItem(clientClass, clientAddresses));
  }

  return Widget.Box({
    class_name: "applist",
    children: AppItems,
    setup: (w) =>
      w
        .hook(
          hyprland,
          (w, address) => {
            if (typeof address !== "string") return;

            // get client
            const newClient = hyprland.getClient(address);
            if (!newClient) return;

            // is newClient has matching class with existing appitems
            const appItemIdx = w.children.findIndex(
              (c) => c.attribute.clientClass === newClient?.class,
            );
            if (appItemIdx !== -1) {
              const childrenCopy = [...w.children];
              const oldAddresses = childrenCopy[appItemIdx].attribute.addresses;
              childrenCopy[appItemIdx] = AppItem(newClient.class, [
                ...oldAddresses,
                address,
              ]);
              w.children = childrenCopy;
            } else {
              w.children = [
                ...w.children,
                AppItem(newClient?.class, [address]),
              ];
            }
          },
          "client-added",
        )
        .hook(
          hyprland,
          (w, address) => {
            if (typeof address !== "string") return;

            // have to use other address of the same class to remove

            const childrenCopy = [...w.children];
            const appItemIdx = w.children.findIndex((c) =>
              c.attribute.addresses.includes(address),
            );
            // console.log(appItemIdx)

            if (appItemIdx !== -1) {
              const oldAddresses = childrenCopy[appItemIdx].attribute.addresses;
              const newAddresses = oldAddresses.filter((oa) => oa !== address);
              // console.log(newAddresses)

              if (newAddresses.length) {
                const clientClass = hyprland.getClient(newAddresses[0]);
                if (!clientClass) return;

                childrenCopy[appItemIdx] = AppItem(
                  clientClass.class,
                  newAddresses,
                );
                w.children = childrenCopy;
              } else {
                childrenCopy.splice(appItemIdx, 1);
                w.children = childrenCopy;
              }
            }
          },
          "client-removed",
        ),
  });
};
