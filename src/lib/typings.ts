type ButtonClass = {
  btn?: string;
  hover?: string;
  focus?: string;
  active?: string;
  badge?: string;
  badgeColor?: string;
};

export type VirtualKeyboardConfig = {
  hideHasChildrenBadge?: boolean;
  childrenXOffset?: number;
  buttonClass?: ButtonClass;
};

export type RegisterPageFunction = (
  name: string,
  isDefault: boolean,
  oldName?: string
) => void;

export type ChangePageFunction = (page: string) => void;

export type ShiftKeyboardFunction = () => void;

export type EmitKeyPressedFunction = (keyName: string) => void;

export type RegisterChildButtonFunction = (value: string) => void;

export type UpdateChildButtonRectFunction = (
  value: string,
  rect: DOMRectReadOnly
) => void;
