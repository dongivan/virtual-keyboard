<template>
  <GenericButton
    :primary="refPrimaryBtn.value"
    :children="refCurrentChildrenBtn.map < string > ((btn) => btn.value)"
    :active="active"
    :config="props.config"
  >
    <template #[slot(props.value)]>
      <slot>{{ props.label || props.value }}</slot>
    </template>
    <template v-for="childBtn of refChildrenBtn" #[slot(childBtn)]>
      <slot :name="slot(childBtn)">
        {{ childBtn.label || childBtn.value }}
      </slot>
    </template>
  </GenericButton>
</template>

<script setup lang="ts">
import { computed, inject, Ref } from "vue";
import GenericButton from "./GenericButton.vue";
import { VirtualKeyboardConfig, ButtonType } from "./typings";
import { parseButtonType, prefix, slot } from "./utils";

type PropsType = {
  value: string | ButtonType;
  label?: string;
  children?: (string | ButtonType)[];
  shiftIndex?: number;
  active?: boolean;
  config?: VirtualKeyboardConfig;
};
const props = withDefaults(defineProps<PropsType>(), {
  label: "",
  children: () => [],
  shiftIndex: 0,
  active: false,
  config: undefined,
});
const defaultBtn = {
  ...parseButtonType(props.value),
  ...(props.label ? { label: props.label } : undefined),
};
const refIsShifted = inject<Readonly<Ref<boolean>>>(prefix("refIsShifted"));

const refChildrenBtn = computed(() => {
  const filtered = [props.value];
  const childrenBtns = props.children
    .map<ButtonType>((child) =>
      typeof child == "string" ? parseButtonType(child) : child
    )
    .filter((childBtn) => {
      if (filtered.includes(childBtn.value)) {
        return false;
      } else {
        filtered.push(childBtn.value);
        return true;
      }
    });
  return childrenBtns;
});
const refPrimaryBtn = computed(() =>
  refIsShifted?.value
    ? refChildrenBtn.value[props.shiftIndex] || defaultBtn
    : defaultBtn
);
const refCurrentChildrenBtn = computed(() => {
  if (refPrimaryBtn.value.value == defaultBtn.value) {
    return refChildrenBtn.value;
  } else {
    return [
      defaultBtn,
      ...refChildrenBtn.value.filter(
        (childBtn) => childBtn.value != refPrimaryBtn.value.value
      ),
    ];
  }
});
</script>
