import { ButtonType } from "./typings";

export function prefix(str: string) {
  return `virtual-keyboard:${str}`;
}

export function parseButtonType(btn: string | ButtonType): ButtonType {
  if (typeof btn == "string") {
    return { value: btn, label: btn };
  } else {
    return {
      value: btn.value,
      label: btn.label == undefined ? btn.value : btn.value,
    };
  }
}
export function slot(btn: string | ButtonType): string {
  return `btn-${typeof btn == "string" ? btn : btn.value}`;
}
