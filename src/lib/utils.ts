import { twMerge } from "tailwind-merge";
import { VirtualKeyboardConfig, ClassName } from "./typings";
import { mergeWith } from "lodash-es";

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
      focus: "ring-2 ring-gray-100",
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

export const mergeOptions: (
  ...args: Record<string, unknown>[]
) => Record<string, unknown> = function (...args) {
  return args.reduce(
    (prev, next) =>
      mergeWith(prev, next, (obj, src) => {
        if (obj == undefined) {
          return;
        }
        if (Array.isArray(obj)) {
          if (Array.isArray(src)) {
            return obj.concat(...src);
          } else {
            return [src];
          }
        } else if (Array.isArray(src)) {
          return [obj, ...src];
        }
      }),
    {}
  );
};

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

export function mergeClasses(...classes: (ClassName | undefined)[]): string {
  const baseIndex = classes.findIndex((cls) => typeof cls == "string" && !!cls);
  return twMerge(
    (classes[baseIndex] as string) || "",
    ...classes
      .slice(0, baseIndex > -1 ? baseIndex : undefined)
      .reverse()
      .filter<string[]>((cls): cls is string[] => Array.isArray(cls))
      .map<string>((clses) => clses.join(" "))
  );
}
