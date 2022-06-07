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
import {
  ClassName,
  RegisterPageFunction,
  VirtualKeyboardConfig,
} from "./typings";
import { prefix, useDefaultConfig, mergeOptions, mergeClasses } from "./utils";

type PropsType = {
  name?: string;
  default?: boolean;
  pageClass?: ClassName;
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
  mergeOptions(refKeyboardConfig?.value || useDefaultConfig(), props.config)
);
provide(prefix("refConfig"), readonly(refConfig));

const attrs = useAttrs();
const refDefaultClass = computed(() =>
  mergeClasses(
    refConfig?.value.pageClass,
    props.pageClass,
    attrs.class as string
  )
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
