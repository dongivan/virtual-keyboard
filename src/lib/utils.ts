import { VirtualKeyboardConfig } from "./typings";

export function prefix(str: string) {
  return `virtual-keyboard:${str}`;
}

export function useDefaultConfig(): VirtualKeyboardConfig {
  return {
    childrenXOffset: -4,
  };
}
