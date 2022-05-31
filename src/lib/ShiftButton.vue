<template>
  <KeyButton value="__SHIFT__" :active="refIsShifted" :config="config">
    <slot :is-shifted="refIsShifted">
      {{ props.label }}
    </slot>
  </KeyButton>
</template>

<script setup lang="ts">
import { inject, Ref } from "vue";
import KeyButton from "./KeyButton.vue";
import { VirtualKeyboardConfig } from "./typings";
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
</script>
