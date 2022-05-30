<template>
  <div class="flex flex-col items-center">
    <h1 class="text-4xl my-8">Virtual Keyboard Dev</h1>
    <div class="my-8">
      <div v-if="refKeyPressed">
        You have pressed this key: "{{ refKeyPressed }}"
      </div>
      <div v-else>Please press the virtual keyboard below:</div>
    </div>
    <VirtualKeyboard @key-pressed="(key) => (refKeyPressed = key)">
      <KeyboardPage name="page-1" default>
        <KeyButton value="__SHIFT__" label="shift" />
        <KeyButton value="1">
          <div>label 1</div>
        </KeyButton>
        <KeyButton value="2" :children="['2a', '2b']">
          <template #[`2a`]>2aa</template>
          <template #[`2b`]>2bb</template>
        </KeyButton>
      </KeyboardPage>
      <KeyboardPage name="page-2">
        <KeyButton value="3" />
        <KeyButton value="4" />
      </KeyboardPage>
      <KeyButton value="page-1" page-button :children="['page-2']">
        go page 1
        <template #[`page-2`]> go page 2 </template>
      </KeyButton>
    </VirtualKeyboard>
  </div>
</template>

<script setup lang="ts">
import VirtualKeyboard from "./lib/VirtualKeyboard.vue";
import KeyboardPage from "./lib/KeyboardPage.vue";
import KeyButton from "./lib/KeyButton.vue";
import { ref } from "vue";

const refKeyPressed = ref("");
</script>

<style lang="scss" scoped>
:deep(.host-button.has-children::after) {
  @apply border-r-blue-400;
}
</style>
