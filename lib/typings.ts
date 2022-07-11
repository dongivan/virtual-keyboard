export type ButtonType = {
  value: string;
  label?: string;
};

export type RegisterPageFunction = (
  name: string,
  isDefault: boolean,
  oldName?: string
) => void;
export type ChangePageFunction = (page: string) => void;
export type ShiftKeyboardFunction = () => void;
export type EmitKeyPressedFunction = (
  value: string,
  options?: { isPrimary?: boolean; targetValue?: string }
) => void;
