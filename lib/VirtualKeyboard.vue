<template>
  <!-- set `touch-action: none;` to prevent from "[Intervention] Ignored ... cancelable=false ..." while click on gap of grid  -->
  <div class="touch-none">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { provide, ref, watch, readonly } from "vue";
import {
  ChangePageFunction,
  EmitKeyPressedFunction,
  RegisterPageFunction,
  ShiftKeyboardFunction,
} from "./typings";
import { prefix } from "./utils";

const emit = defineEmits<{
  (event: "key-pressed", name: string): void;
}>();
provide<EmitKeyPressedFunction>(prefix("emitKeyPressed"), (name) => {
  emit("key-pressed", name);
});

const refIsShifted = ref(false);
provide(prefix("refIsShifted"), readonly(refIsShifted));
provide<ShiftKeyboardFunction>(prefix("shiftKeyboard"), () => {
  refIsShifted.value = !refIsShifted.value;
});

const refCurrentPage = ref("");
const refPages = ref([] as string[]);
provide(prefix("refCurrentPage"), readonly(refCurrentPage));
provide<RegisterPageFunction>(
  prefix("registerPage"),
  (name, isDefault, oldName) => {
    refPages.value = Array.from(
      new Set([
        ...(oldName
          ? refPages.value.filter((page) => page != oldName)
          : refPages.value),
        name,
      ])
    );
    if (refCurrentPage.value == "" || isDefault) {
      refCurrentPage.value = name;
    }
  }
);
provide<ChangePageFunction>(prefix("changePage"), (page) => {
  if (refPages.value.includes(page)) {
    refCurrentPage.value = page;
  }
});
watch(refCurrentPage, () => {
  refIsShifted.value = false;
});
</script>

<style lang="scss" scoped>
:deep() {
  .vk-page {
    @apply w-full h-full flex gap-1 flex-wrap;
  }

  .vk-btn {
    @apply w-fit min-w-[2rem] h-fit min-h-[2rem] p-2 rounded border-0;

    &.default {
      @apply bg-gray-200;
    }
    &.active {
      @apply bg-gray-400;
    }
    &.hover {
      @apply bg-gray-300;
    }
    &.focus {
      @apply bg-gray-200 ring-2 ring-gray-100;
    }

    .vk-btn-badge {
      @apply absolute top-0 right-0;

      &.hide {
        @apply hide;
      }
      &.triangle {
        @apply w-0 h-0 rounded-tr border-solid border-width-[6px] border-transparent border-t-blue-400 border-r-blue-400;
      }
      &.slot {
        @apply min-w-[50%] min-h-min scale-75 origin-top-right text-gray-600;
      }
    }

    .vk-btn-children {
      @apply min-w-full w-max flex gap-1 p-1 border border-solid border-gray-400 rounded-md bg-gray-100;
    }
  }
}
</style>
