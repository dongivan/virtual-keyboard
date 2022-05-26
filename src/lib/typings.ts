export type RegisterPageFunction = (
  name: string,
  isDefault: boolean,
  oldName?: string
) => void;

export type ChangePageFunction = (page: string) => void;

export type ShiftKeyboardFunction = () => void;

export type EmitKeyPressedFunction = (keyName: string) => void;
