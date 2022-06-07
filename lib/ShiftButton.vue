<template>
  <GenericButton primary="__SHIFT__" :active="refIsShifted" :config="config">
    <template #btn-__SHIFT__>
      <slot :is-shifted="refIsShifted">
        {{ props.label }}
      </slot>
    </template>
  </GenericButton>
</template>

<script setup lang="ts">
import { inject, provide, Ref } from "vue";
import GenericButton from "./GenericButton.vue";
import {
  EmitKeyPressedFunction,
  ShiftKeyboardFunction,
  VirtualKeyboardConfig,
} from "./typings";
import { prefix } from "./utils";

type PropsType = {
  label?: string;
  config?: VirtualKeyboardConfig;
};
const props = withDefaults(defineProps<PropsType>(), {
  label: "Shift",
  config: undefined,
});

const refIsShifted = inject<Readonly<Ref<boolean>>>(prefix("refIsShifted"));
const shiftKeyboard = inject<ShiftKeyboardFunction>(prefix("shiftKeyboard"));
provide<EmitKeyPressedFunction>(prefix("emitKeyPressed"), () => {
  shiftKeyboard?.();
});
</script>
