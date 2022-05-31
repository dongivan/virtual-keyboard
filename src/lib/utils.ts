import { twMerge } from "tailwind-merge";
import { VirtualKeyboardConfig } from "./typings";

export function prefix(str: string) {
  return `virtual-keyboard:${str}`;
}

export function useDefaultConfig(): VirtualKeyboardConfig {
  return {
    defaultPageClass: "flex gap-1 flex-wrap",
    buttonClass: {
      btn: "w-fit min-w-[2rem] h-fit min-h-[2rem] p-2 rounded bg-gray-200",
      active: "bg-gray-400",
      hover: "bg-gray-300",
      badge:
        "absolute top-0 right-0 w-0 h-0 rounded-tr border-l-transparent border-b-transparent border-[6px]",
      badgeColor: "border-blue-400",
    },
    childrenContainerClass:
      "min-w-full w-max flex gap-1 p-1 border border-gray-400 rounded-md bg-gray-100",
    childButtonClass: {},
    childrenContainerOffset: {
      alignmentAxis: 0,
      mainAxis: 2,
    },
  };
}

export function mergeVueBindedClasses(
  classes:
    | undefined
    | string
    | Record<string, unknown>
    | (undefined | string | Record<string, unknown>)[]
): string {
  if (Array.isArray(classes)) {
    return twMerge(
      ...classes.map<string>((cls) =>
        typeof cls == "string"
          ? cls
          : cls == undefined
          ? ""
          : Object.keys(cls)
              .filter((clsName) => cls[clsName])
              .join(" ")
      )
    );
  } else {
    return mergeVueBindedClasses([classes]);
  }
}
