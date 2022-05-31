export type ClassName = string | string[];

type ButtonClass = {
  btn?: ClassName;
  hover?: ClassName;
  focus?: ClassName;
  active?: ClassName;
};
type HasBadgeClass = {
  badge?: ClassName;
  badgeColor?: ClassName;
};

export type VirtualKeyboardConfig = {
  hideHasChildrenBadge?: boolean;
  defaultPageClass?: ClassName;
  buttonClass?: ButtonClass & HasBadgeClass;
  childrenContainerClass?: ClassName;
  childButtonClass?: ButtonClass;
  childrenContainerOffset?: {
    mainAxis?: number;
    crossAxis?: number;
    alignmentAxis?: number;
  };
};

export type RegisterPageFunction = (
  name: string,
  isDefault: boolean,
  oldName?: string
) => void;

export type ChangePageFunction = (page: string) => void;

export type ShiftKeyboardFunction = () => void;

export type EmitKeyPressedFunction = (keyName: string) => void;
