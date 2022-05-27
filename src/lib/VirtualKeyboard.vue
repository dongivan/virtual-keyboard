<template>
  <div :class="defaultClass" :style="cssVariables">
    <div class="w-full h-full">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref, watch, useAttrs, PropType } from "vue";
import {
  ChangePageFunction,
  EmitKeyPressedFunction,
  RegisterPageFunction,
  ShiftKeyboardFunction,
  VirtualKeyboardConfig,
} from "./typings";
import { prefix } from "./utils";

const props = defineProps({
  config: {
    type: Object as PropType<VirtualKeyboardConfig>,
    default: () => {
      return {
        childrenBadgeColor: "#c084fc",
        childrenXOffset: -4,
      };
    },
  },
});
provide<VirtualKeyboardConfig>(prefix("config"), props.config);
const cssVariables = {
  "--vk-btn-badge-color-var": props.config.childrenBadgeColor,
};

const emit = defineEmits<{
  (event: "key-pressed", name: string): void;
}>();
provide<EmitKeyPressedFunction>(prefix("emitKeyPressed"), (name) => {
  emit("key-pressed", name);
});

const attrs = useAttrs();
const defaultClass = attrs.class || "w-screen max-h-fit bg-gray-50";

const refIsShifted = ref(false);
provide(prefix("refIsShifted"), refIsShifted);
provide<ShiftKeyboardFunction>(prefix("shiftKeyboard"), () => {
  refIsShifted.value = !refIsShifted.value;
});

const refCurrentPage = ref("");
const refPages = ref([] as string[]);
provide(prefix("refCurrentPage"), refCurrentPage);
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

provide(prefix("isChildButton"), false);
</script>
