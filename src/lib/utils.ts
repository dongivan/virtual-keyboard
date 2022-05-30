import { VirtualKeyboardConfig } from "./typings";

export function prefix(str: string) {
  return `virtual-keyboard:${str}`;
}

export function useDefaultConfig(): VirtualKeyboardConfig {
  return {
    defaultPageClass: "flex gap-1 flex-wrap",
    buttonClass: {
      btn: "w-fit min-w-[2rem] h-fit min-h-[2rem] p-4 rounded bg-gray-300",
      hover: "bg-blue-400",
      active: "bg-blue-500",
      badge:
        "absolute top-0 right-0 w-0 h-0 rounded-tr border-l-transparent border-b-transparent border-[6px]",
      badgeColor: "border-blue-400",
    },
    childrenContainerClass: "w-fit flex gap-1 p-1 box-content",
    childrenContainerOffset: {
      alignmentAxis: -4,
    },
  };
}
