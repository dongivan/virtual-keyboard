<template>
  <div
    v-show="refCurrentPage == name"
    class="w-full h-full"
    :class="refDefaultClass"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, provide, readonly, Ref, useAttrs, watch } from "vue";
import { RegisterPageFunction, VirtualKeyboardConfig } from "./typings";
import { prefix, useDefaultConfig } from "./utils";
import mergeOptions from "merge-options";

type PropsType = {
  name?: string;
  default?: boolean;
  pageClass?: string;
  config?: VirtualKeyboardConfig;
};
const props = withDefaults(defineProps<PropsType>(), {
  name: "",
  default: false,
  pageClass: "",
  config: undefined,
});

const refKeyboardConfig = inject<Readonly<Ref<VirtualKeyboardConfig>>>(
  prefix("refConfig")
);
const refConfig = computed<VirtualKeyboardConfig>(() =>
  mergeOptions(useDefaultConfig(), refKeyboardConfig?.value, props.config)
);
provide(prefix("refConfig"), readonly(refConfig));

const attrs = useAttrs();
const refDefaultClass = computed(() =>
  attrs.class ? "" : props.pageClass || refConfig?.value.defaultPageClass || ""
);

const registerPage = inject<RegisterPageFunction>(prefix("registerPage"));
watch(
  () => props.name,
  (name, oldName) => {
    registerPage?.(name, props.default, oldName);
  },
  { immediate: true }
);

const refCurrentPage = inject<Readonly<Ref<string>>>(prefix("refCurrentPage"));

const refIsKeyboardShifted = inject<Readonly<Ref<boolean>>>(
  prefix("refIsShifted")
);
const refIsShifted = computed(() => {
  return refCurrentPage?.value == props.name && refIsKeyboardShifted?.value;
});
provide(prefix("refIsShifted"), readonly(refIsShifted));
</script>
