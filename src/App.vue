<template>
  <div class="flex flex-col items-center">
    <h1 class="text-4xl my-8">Virtual Keyboard Dev</h1>
    <div class="my-8">
      <div v-if="refKeyPressed">
        You have pressed this key: "{{ refKeyPressed }}"
      </div>
      <div v-else>Please press the virtual keyboard below:</div>
    </div>
    <VirtualKeyboard
      class="w-full border rounded border-gray-600 p-2"
      @key-pressed="(key) => (refKeyPressed = key)"
    >
      <div class="flex flex-col gap-1">
        <div class="flex gap-1">
          <KeyboardPage name="page-1" default>
            <ShiftButton />
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
          <KeyboardPage name="page-1">
            <KeyButton value="5" />
          </KeyboardPage>
        </div>
        <KeyboardPage name="eng">
          <EnglishLayout />
        </KeyboardPage>
        <KeyboardPage name="num">
          <NumberLayout />
        </KeyboardPage>
        <KeyButton
          value="page-1"
          page-button
          :children="['page-2', 'eng', 'num']"
        />
      </div>
    </VirtualKeyboard>
  </div>
</template>

<script setup lang="ts">
import VirtualKeyboard from "./lib/VirtualKeyboard.vue";
import KeyboardPage from "./lib/KeyboardPage.vue";
import KeyButton from "./lib/KeyButton.vue";
import ShiftButton from "./lib/ShiftButton.vue";
import EnglishLayout from "./lib/layouts/EnglishLayout.vue";
import NumberLayout from "./lib/layouts/NumberLayout.vue";
import { ref } from "vue";

const refKeyPressed = ref("");
</script>
