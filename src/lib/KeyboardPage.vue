<template>
  <div v-show="refCurrentPage == name" class="w-full h-full">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, provide, watch } from "vue";
import { RegisterPageFunction } from "./typings";
import { prefix } from "./utils";

const props = defineProps({
  name: { type: String, default: "" },
  default: { type: Boolean, default: false },
});

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
