# virtual-keyboard

A virtual keyboard based on Vue 3.2 (and floating ui).

# Installation
```
npm install @dongivan/virtual-keyboard --save
```

# Components Usage
Just import and use it in your template.
```html
<template>
  <VirtualKeyboard class="..." @key-pressed="(key) => ...">
    <div class="...">
      <KeyButton v-for="i of 10" :key="`key-${i - 1}`" :value="i - 1" />
    </div>
  </VirtualKeyboard>
</template>

<script setup lang="ts">
import {
  VirtualKeyboard,
  KeyButton,
} from "@dongivan/virtual-keyboard"
</script>
```
You can use `KeyboardPage` if you have multiple pages of virtual keyboard (remember to use `PageButton` to change the current page).
```html
<template>
  <VirtualKeyboard class="..." @key-pressed="(key) => ...">
    <KeyboardPage name="num" default>
      <div class="...">
        <KeyButton v-for="i of 10" :key="`key-${i - 1}`" :value="i - 1" />
      </div>
    </KeyboardPage>
    <KeyboardPage name="eng" default>
      <div class="...">
        <KeyButton v-for="v of 'abcdefghijklmnopqrstuvwxyz'.split('')" :key="`key-${v}`" :value="v" />
      </div>
    </KeyboardPage>
    <div class="...">
      <PageButton value="num" :children="['eng']" />
    </div>
  </VirtualKeyboard>
</template>

<script setup lang="ts">
import {
  VirtualKeyboard,
  KeyButton,
  KeyboardPage,
  PageButton,
} from "@dongivan/virtual-keyboard"
</script>
```
`ShiftButton` will shift the current keyboard page (which means each key in current keyboard page will be shifted if it could).
```html
<template>
  <VirtualKeyboard class="..." @key-pressed="(key) => ...">
    <div class="...">
      <KeyButton v-for="v of 'abcdefghijklmnopqrstuvwxyz'.split('')" :key="`key-${v}`" :children="[v.toUpperCase()]" :value="v" />
    </div>
    <div class="...">
      <ShiftButton />
    </div>
  </VirtualKeyboard>
</template>

<script setup lang="ts">
import {
  VirtualKeyboard,
  KeyButton,
  ShiftButton,
} from "@dongivan/virtual-keyboard"
</script>
```

# Css classes
Use default css by import `default.css`:
```ts
import "@dongivan/virtual-keyboard/default.css";
```

Or, you can speicify your own styles by define css classes:
| Css Class Name | Component | Element | Description |
|:----:|:----:|:----|:----|
| `.vk-page` | `KeyboardPage` | root element | |
| `.vk-btn` | `GenerateButton`, `KeyButton`, `PageButton`, `ShiftButton` | root element | base class |
| `.vk-btn.default` | the same as above | root element |  default state |
| `.vk-btn.active` | the same as above | root element |  active state |
| `.vk-btn.hover` | the same as above | root element |  hover state |
| `.vk-btn.focus` | the same as above | root element |  focus state |
| `.vk-btn .vk-btn-badge` | the same as above | badge element | base class |
| `.vk-btn .vk-btn-badge.hide` | the same as above | badge element | hide badge |
| `.vk-btn .vk-btn-badge.triangle` | the same as above | badge element | show triangle |
| `.vk-btn .vk-btn-badge.slot` | the same as above | badge element | use slot |
| `.vk-btn .vk-btn-children` | the same as above | children container element | container class |
| `.vk-btn .vk-btn-children .vk-btn` | the same as above | root element of child button | base class |
| `.vk-btn .vk-btn-children .vk-btn.default` | the same as above | child button | default state |
| `.vk-btn .vk-btn-children .vk-btn.active` | the same as above | child button | active state |
| `.vk-btn .vk-btn-children .vk-btn.hover` | the same as above | child button | hover state |
| `.vk-btn .vk-btn-children .vk-btn.focus` | the same as above | child button | focus state |

Use `:deep()` while there is a `scoped` attribute in `<style>` tag:
```html
<style scoped>
  :deep() {
    .vk-button {
      width: 32px;
    }
  }
</style>
```

# Components
There are 5 main Vue componenets: `VirtualKeyboard`, `KeyButton`, `KeyboardPage`, `PageButton` and `ShiftButton`. 

`VirtualKeyboard` acts as a root component so you have to put the other components in it. You should add `key-pressed` listener to it and other components will not emit any events(they use Vue `project`/`inject` to communicate with each other.).

`KeyButton` acts as a common button.

The other 3 components are all optional, you can use them in your case.

## Component `VirtualKeyboard`
### Events
| Event | payloads | Description |
|:-----:|:--------:|:------------|
| key-pressed | (key: `string`) | This event will be emitted a key (which is a child of the `VirtualKeyboard` ) is pressed |

### Slots
`VirtualKeyboard` has only a default slot. You should put all the children components in it.

### Classes & Styles
Just use `class` & `style` attribute.

## Component `KeyButton`
### Props
| Prop | Type | Default | Description |
|:----:|:----:|:-------:|:------------|
| value | `string` | required | This `value` will be emitted in the `key-pressed` event of `VirtualKeyboard`. And it will be set as the label if the `label` is "" and the slot (`#btn-${value}`) is not set. |
| label | `string` | "" | The label of this key button. |
| children | `(string\|ButtonType)[]` | [] | The children buttons of this key button. The label strategy is just like the `KeyButton`. |
| shiftIndex | `number` | 0 | When the `VirtualKeyboard` is shifted, the `children[shiftIndex]` will replace the current key button. |
| active | `boolean` | `false` | The `.vk-btn .active` class will be add to the button element if this prop is `true`. 
| badge | `"auto"\|"hide"\|"triangle"\|"slot"` | `"auto"` | The badge is a symbol on the right-top of the `KeyButton`, and it will be visible if `badge !== "hide"` and the `KeyButton` has at least one child.<br>- `"triangle"` will add `.triangle` to the badge of the key button; <br>- `"slot"` will add `.slot`; <br>- `"auto"` will add `.slot` if there are only one child, or add `.triangle` if there are more than one child; <br>- `"hide"` will hide the badge. |
| css | `GenericButtonCss` | see below | The css classes used by the component |
| childrenOffset | `{ alignmentAxis: number; mainAxis: number; crossAxis: number; }` | `{ alignmentAxis: 0, crossAxis: 0, mainAxis: 2 }` | `VirtualKeyboard` uses [Floating UI](https://github.com/floating-ui/floating-ui) to show the children elements of a button, and the `childrenOffset` is used to set the position of the floating elements. Its value will send to the `offset` Middleware of Floating UI as the [params](https://floating-ui.com/docs/offset). |

`GenericButtonCss` type:
```ts
type BadgeCss = {
  base?: string;
  hide?: string;
  triangle?: string;
  slot?: string;
};
type ButtonCss = {
  base?: string;
  default?: string;
  active?: string;
  hover?: string;
  focus?: string;
};
type GenericButtonCss = ButtonCss & {
  badge?: BadgeCss;
  children?: ButtonCss & {
    container?: string;
  };
};
```

Prop `css` default value:
```ts
{
  base: "vk-btn",
  default: "default",
  active: "active",
  hover: "hover",
  focus: "focus",
  badge: {
    base: "vk-btn-badge",
    hide: "hide",
    triangle: "triangle",
    slot: "slot",
  },
  children: {
    container: "vk-btn-children",
  },
}
```
### Slots
Use the default slot for the default `value` and the named slot (as `btn-${child}`) for the children if you want to show an icon or something else on the button or the child button.

For example: 
```html
<KeyButton value="u" :children="['ǖ', 'ǘ', { value: 'ǚ', label: 'letter ǚ'}, 'ǜ']" >
  <template>letter u</template>
  <template #btn-ǘ>letter ǘ</template>
  <template #[`btn-ǜ`]>letter ǜ</template>
</KeyButton>
```
### Classes & Styles
You can use `class` & `style` (includes `:class` & `:style`) on the `KeyButton` component, however it is difficult to set the children elements or different states, so I recommend you to define css classes as `.vk-btn` or use the prop `css`.

## Component `KeyboardPage`
You should use this component when your virtual keyboard has multiple layouts (or pages). Each `KeyboardPage` has a prop named `name`, and it will be visible when the current page of its parent `VirtualKeyboard` equals to this prop (which means that you can have multiple `KeyboardPage` with the same `name`, and they will be all visible if the current page of `VirtualKeyboard` equals to it).
### Props
| Prop | Type | Default | Description |
|:----:|:----:|:-------:|:------------|
| name | `string` | required | The name of this page. |
| default | `boolean` | `false` | Set it to `true` if the `KeyboardPage` should be visible as default page. |
| pageClass | `string` | "vk-page" | The HTML class of the `KeyboardPage` root element.  |
### Slots
`KeyboardPage` has only a default slot. You should put all the children components in it.
### Classes & Styles
The same as the classes & styles of `KeyButton` components, and furthermore you can use the prop `pageClass`.

## Component `PageButton`
`VirtualKeyboard` provides a `changePage` function (with the type `ChangePageFunction`) for its children components using `provide`/`inject` of Vue, and `PageButton` will call this function if it is pressed.

`PageButton` will automatically set the button to active when the current page of `VirutalKeyboard` equals to its `name`, and it will also show the correct label (or slot) of the current page. 
### Props
The props of `PageButton` are almost the same as `KeyButton`, except `PageButton` does not have props `active` and `shiftIndex`.
### Slots
The same as `KeyButton`.
### Classes & Styles
The same as `KeyButton`.

## Component `ShiftButton`
As the same of `PageButton`, `VirtualKeyboard` provides a `shiftKeyboard` function (with the type `ShiftKeyboardFunction`)and `ShiftButton` will call this function if it is pressed.
### Props
| Prop | Type | Default | Description |
|:----:|:----:|:-------:|:------------|
| label | `string` | "Shift" | The label of the shift button. |
### Slots
`ShiftButton` has only a default slot which is scoped. It can be used to show icons or something else.
| Scoped Prop | Type | Description |
|:-----------:|:----:|:------------|
| isShifted | `boolean` | whether the `VirtualKeyboard` is shifted |
### Classes & Styles
The same as `KeyButton` except `ShiftButton` does not have children buttons.
