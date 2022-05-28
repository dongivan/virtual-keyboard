<template>
  <div
    v-show="refCurrentPage == name"
    class="w-full h-full"
    :class="defaultClass"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, PropType, provide, useAttrs, watch } from "vue";
import { RegisterPageFunction, VirtualKeyboardConfig } from "./typings";
import { prefix, useDefaultConfig } from "./utils";

const props = defineProps({
  name: { type: String, default: "" },
  default: { type: Boolean, default: false },
  pageClass: { type: String, default: "flex gap-1 flex-wrap" },
  config: {
    type: Object as PropType<VirtualKeyboardConfig>,
    default: () => ({}),
  },
});
const keyboardConfig = inject<VirtualKeyboardConfig>(prefix("config"));
provide<VirtualKeyboardConfig>(prefix("config"), {
  ...useDefaultConfig(),
  ...keyboardConfig,
  ...props.config,
});

const attrs = useAttrs();
const defaultClass = attrs.class ? "" : props.pageClass;

const registerPage = inject<RegisterPageFunction>(prefix("registerPage"));
watch(
  () => props.name,
  (name, oldName) => {
    registerPage?.(name, props.default, oldName);
  },
  { immediate: true }
);

const refCurrentPage = inject<string>(prefix("refCurrentPage"));

const refIsKeyboardShifted = inject<boolean>(prefix("refIsShifted"));
const refIsShifted = computed(() => {
  return refCurrentPage == props.name && refIsKeyboardShifted;
});
provide(prefix("refIsShifted"), refIsShifted);
</script>
