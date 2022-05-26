<template>
  <button :class="defaultClass" @click="handleClick(value)">
    <slot>
      {{ label || value }}
    </slot>
  </button>
</template>

<script setup lang="ts">
import { inject, useAttrs } from "vue";
import {
  ChangePageFunction,
  EmitKeyPressedFunction,
  ShiftKeyboardFunction,
} from "./typings";
import { prefix } from "./utils";

const props = defineProps({
  value: { type: String, required: true },
  label: { type: String, default: "" },
  pageButton: { type: Boolean, default: false },
});

const attrs = useAttrs();
const defaultClass =
  attrs.class ||
  "w-fit min-w-[2rem] h-fit px-2 min-h-[2rem] m-1 bg-gray-300 rounded-md hover:bg-blue-400 active:bg-blue-500";

const emitClicked = inject<EmitKeyPressedFunction>(prefix("emitKeyPressed"));
const changePage = inject<ChangePageFunction>(prefix("changePage"));
const shiftKeyboard = inject<ShiftKeyboardFunction>(prefix("shiftKeyboard"));

const handleClick = (value: string) => {
  if (props.pageButton) {
    changePage?.(value);
  } else if (value == "__SHIFT__") {
    shiftKeyboard?.();
  } else {
    emitClicked?.(value);
  }
};
</script>
