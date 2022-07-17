<template>
  <div v-show="refCurrentPage == name" :class="refDefaultClass">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, provide, readonly, Ref, useAttrs, watch } from "vue";
import { RegisterPageFunction } from "./typings";
import { prefix } from "./utils";

type PropsType = {
  name?: string;
  default?: boolean;
  pageClass?: string;
};
const props = withDefaults(defineProps<PropsType>(), {
  name: "",
  default: false,
  pageClass: "vk-page",
});

const attrs = useAttrs();
const refDefaultClass = computed(() => [
  props.pageClass,
  attrs.class as string,
]);

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
