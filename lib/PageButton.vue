<template>
  <GenericButton
    :primary="refPrimaryBtn.value"
    :children="refCurrentChildrenBtn.map < string > ((btn) => btn.value)"
    :active="refIsActive"
    :badge="badge"
  >
    <template #[slot(props.value)]>
      <slot :is-current="props.value == refCurrentPage">{{
        props.label || props.value
      }}</slot>
    </template>
    <template v-for="childBtn of refChildrenBtn" #[slot(childBtn)]>
      <slot
        :name="slot(childBtn)"
        :is-current="childBtn.value == refCurrentPage"
      >
        {{ childBtn.label || childBtn.value }}
      </slot>
    </template>
  </GenericButton>
</template>

<script setup lang="ts">
import { computed, inject, provide, Ref } from "vue";
import GenericButton from "./GenericButton.vue";
import {
  ButtonType,
  EmitKeyPressedFunction,
  ChangePageFunction,
} from "./typings";
import { parseButtonType, prefix, slot } from "./utils";

type PropsType = {
  value: string | ButtonType;
  label?: string;
  children?: (string | ButtonType)[];
  badge?: "auto" | "hide" | "triangle" | "slot";
};
const props = withDefaults(defineProps<PropsType>(), {
  label: "",
  children: () => [],
  badge: "auto",
});
const defaultBtn = {
  ...parseButtonType(props.value),
  ...(props.label ? { label: props.label } : undefined),
};
const refCurrentPage = inject<Readonly<Ref<string>>>(prefix("refCurrentPage"));

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
const refPrimaryBtn = computed(
  () =>
    refChildrenBtn.value.find(
      (childBtn) => childBtn.value == refCurrentPage?.value
    ) || defaultBtn
);
const refIsActive = computed(
  () => refPrimaryBtn.value.value == refCurrentPage?.value
);
const refCurrentChildrenBtn = computed(() =>
  refPrimaryBtn.value.value == defaultBtn.value
    ? refChildrenBtn.value
    : [
        defaultBtn,
        ...refChildrenBtn.value.filter(
          (childBtn) => childBtn.value != refPrimaryBtn.value.value
        ),
      ]
);

const changePage = inject<ChangePageFunction>(prefix("changePage"));
provide<EmitKeyPressedFunction>(prefix("emitKeyPressed"), (value, payloads) => {
  if (payloads?.isPrimary && value == refCurrentPage?.value) {
    const page = refCurrentChildrenBtn.value.find(
      (child) => child.value != value
    )?.value;
    if (page) {
      changePage?.(page);
      return;
    }
  }
  changePage?.(value);
});
</script>
