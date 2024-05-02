import type { SliderProps } from "types/widgets/slider";

export default ({ ...props }: SliderProps) => {
  return Widget.Slider({
    css: `
                min-width: 4px;
                min-height: 4px;
            `,
    hexpand: true,
    draw_value: false,
    ...props,
  });
};
