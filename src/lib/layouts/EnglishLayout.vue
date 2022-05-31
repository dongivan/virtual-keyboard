<template>
  <div class="w-full h-max grid grid-cols-[repeat(20,1fr)] grid-rows-3 gap-1">
    <KeyButton
      v-for="key of 'qwertyuiopasdfghjklzxcvbnm'.split('')"
      :key="key"
      :value="key"
      :children="[key.toUpperCase()]"
      :config="config"
      :style="{ gridColumnEnd: 'span 2', width: '100%' }"
    ></KeyButton>
    <div class="col-start-1 col-end-2 row-start-2 row-end-3" />
    <div class="col-start-1 col-end-3 row-start-3 row-end-4" />
    <ShiftButton :style="{ gridColumnEnd: 'span 3', width: '100%' }" />
  </div>
</template>

<script setup lang="ts">
import KeyButton from "../KeyButton.vue";
import ShiftButton from "../ShiftButton.vue";

const config = {
  hideHasChildrenBadge: true,
  buttonClass: {
    btn: ["!w-full !h-full"],
  },
  childrenContainerOffset: {
    alignmentAxis: 0,
  },
};
</script>
