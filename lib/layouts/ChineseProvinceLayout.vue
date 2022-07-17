<template>
  <div class=":uno: w-full h-max grid grid-cols-9 grid-rows-4 gap-1">
    <KeyButton
      v-for="key of refProvinces"
      :key="key"
      :value="key"
      :css="{
        common: ':uno: vk-btn !w-full !h-full',
      }"
    ></KeyButton>
    <div
      v-if="$slots['left-bottom']"
      class=":uno: col-start-1 col-end-2 row-start-4 row-end-5"
    >
      <slot name="left-bottom"></slot>
    </div>
    <slot name="right-bottom"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import KeyButton from "../KeyButton.vue";

type PropsType = {
  order?: "pinyin" | "geo";
};

const props = withDefaults(defineProps<PropsType>(), {
  order: "pinyin",
});
const provinces = {
  pinyin:
    "澳川鄂甘赣港桂贵黑沪吉冀津晋京辽鲁蒙闽宁青琼陕苏台皖湘新渝豫粤云藏浙",
  geo: "新甘蒙宁陕晋黑吉辽青川渝豫鄂京津冀鲁藏云贵湘皖赣苏浙沪桂琼粤闽澳港台",
};

const refProvinces = computed(() => {
  return (provinces[props.order] || provinces.pinyin).split("");
});
</script>
