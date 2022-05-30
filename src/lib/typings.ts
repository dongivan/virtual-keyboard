type ButtonClass = {
  btn?: string;
  hover?: string;
  focus?: string;
  active?: string;
};
type HasBadgeClass = {
  badge?: string;
  badgeColor?: string;
};

export type VirtualKeyboardConfig = {
  hideHasChildrenBadge?: boolean;
  defaultPageClass?: string;
  buttonClass?: ButtonClass & HasBadgeClass;
  childrenContainerClass?: string;
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
