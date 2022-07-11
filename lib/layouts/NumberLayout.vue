<template>
  <div class="w-full h-max grid grid-cols-3 grid-rows-4 gap-1">
    <KeyButton
      v-for="key of refNumbers.split('')"
      :key="key"
      :value="key"
      :css="{
        common: 'vk-btn !w-full !h-full',
      }"
    ></KeyButton>
    <div class="col-start-1 col-end-2 row-start-4 row-end-5">
      <slot name="left-bottom"></slot>
    </div>
    <slot name="right-bottom"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import KeyButton from "../KeyButton.vue";

type PropsType = {
  mode?: "calculator" | "mobilephone" | "random";
};
const props = withDefaults(defineProps<PropsType>(), {
  mode: "mobilephone",
});

const refNumbers = ref("1234567890");
const random: () => string = () => {
  const result = "1234567890".split("");
  for (let i = 9; i >= 0; i--) {
    const j = Math.floor(Math.random() * i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.join("");
};
watch(
  () => props.mode,
  (mode) => {
    if (mode == "random") {
      refNumbers.value = random();
    } else {
      refNumbers.value = {
        calculator: "7894561230",
        mobilephone: "1234567890",
      }[mode];
    }
  },
  { immediate: true }
);
defineExpose({
  update: () => {
    refNumbers.value = random();
  },
});
</script>
