import type { BoxProps } from "types/widgets/box";

export default ({
  class_name = "divider",
  hexpand = true,
  visible = true,
}: BoxProps) => {
  return Widget.Box({
    class_name,
    hexpand,
    visible,
  });
};
