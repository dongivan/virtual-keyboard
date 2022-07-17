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

<style lang="scss" scoped src="./css/VirtualKeyboard.scss"></style>
