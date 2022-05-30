<template>
  <button
    v-bind="$attrs"
    ref="refButtonEle"
    class="relative select-none"
    :class="[
      refBtnClass,
      {
        [refBtnHoverClass]: refIsMouseover,
        [refBtnActiveClass]:
          refIsTouching || (refIsMouseover && refIsMousedown),
        [refBtnFocusClass]: refIsFocused,
      },
    ]"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
    @mousedown="handleMousedown"
    @mouseup="handleMouseup"
    @touchstart.prevent="handleTouchstart"
    @touchmove.prevent="handleTouchmove"
    @touchend.prevent="handleTouchend"
    @focusin="handleFocusin"
    @focusout="handleFocusout"
  >
    <div
      v-if="
        refChildrenBtns.length > 0 &&
        !refIsChildrenVisible &&
        !refConfig.hideHasChildrenBadge
      "
      :class="refBadgeClasses"
    ></div>
    <slot :name="refPrimaryBtn.slotName">
      {{ refPrimaryBtn.label || refPrimaryBtn.value }}
    </slot>
    <template v-if="refVisibleChildrenBtns.length > 0">
      <div
        v-show="refIsChildrenVisible"
        ref="refChildrenContainerEle"
        class="absolute"
        :class="[
          refChildrenContainerClass,
          { 'flex-row-reverse': refReverseChildren },
        ]"
        :style="refChildrenPositionStyle"
      >
        <button
          v-for="child of refVisibleChildrenBtns"
          :key="child.value"
          ref="refChildrenBtnEles"
          :class="[
            refChildBtnClass,
            {
              [refChildBtnHoverClass]: refMouseoverChildBtn == child.value,
              [refChildBtnActiveClass]:
                refTouchmoveChildBtn == child.value ||
                (refMouseoverChildBtn == child.value &&
                  refMousedownChildBtn == child.value),
              [refChildBtnFocusClass]: refFocusedChildBtn == child.value,
            },
          ]"
          :data-vk-btn-value="child.value"
          @click.stop="handleClick(child.value)"
          @mouseenter.stop="handleMouseenterChild(child.value, $event)"
          @mouseleave.stop="handleMouseleaveChild"
          @mousedown.stop="handleMousedownChild(child.value, $event)"
          @mouseup.stop="handleMouseupChild"
          @focusin.stop="handleFocusinChild(child.value, $event)"
          @focusout.stop="handleFocusoutChild"
        >
          <slot :name="child.slotName">{{ child.label || child.value }}</slot>
        </button>
      </div>
    </template>
  </button>
</template>

<script lang="ts">
import { detectOverflow, Middleware, offset } from "@floating-ui/dom";
export default {
  inheritAttrs: false,
};

const placeChildren = (): Middleware => ({
  name: "placeChildren",
  async fn(middlewareArguments) {
    const overflow = await detectOverflow(middlewareArguments);
    if (overflow.right > 0) {
      return {
        reset: {
          placement: "top-end",
        },
        data: {
          reversed: true,
        },
      };
    } else if (
      middlewareArguments.placement !== "top-start" &&
      middlewareArguments.placement !== "top-end"
    ) {
      return {
        reset: {
          placement: "top-start",
        },
        data: {
          reversed: false,
        },
      };
    } else {
      return {
        data: {
          reversed:
            middlewareArguments.middlewareData.placeChildren?.reversed || false,
        },
      };
    }
  },
});
</script>

<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  Ref,
  ref,
  useAttrs,
  watch,
} from "vue";
import {
  ChangePageFunction,
  EmitKeyPressedFunction,
  ShiftKeyboardFunction,
  VirtualKeyboardConfig,
} from "./typings";
import { computePosition } from "@floating-ui/dom";
import { prefix, useDefaultConfig } from "./utils";

const refButtonEle = ref();
const refChildrenContainerEle = ref();
const refChildrenBtnEles = ref([]);

type ButtonType = {
  value: string;
  label?: string;
};

type SlotedButtonType = ButtonType & {
  slotName: string;
};

/* Vue 3.2 defineProps does not support union type ? */
/* type PropsType = ButtonType & { */
type PropsType = {
  value: string;
  label?: string;
  children?: (ButtonType | string)[];
  shiftIndex?: number;
  pageButton?: boolean;
  btnClass?: string;
  hoverClass?: string;
  focusClass?: string;
  activeClass?: string;
  badgeClass?: string;
  badgeColorClass?: string;
  childrenContainerClass?: string;
  childBtnClass?: string;
  childHoverClass?: string;
  childFocusClass?: string;
  childActiveClass?: string;
  config?: VirtualKeyboardConfig;
};
const props = withDefaults(defineProps<PropsType>(), {
  label: "",
  children: () => [],
  shiftIndex: 0,
  pageButton: false,
  btnClass: "",
  hoverClass: "",
  focusClass: "",
  activeClass: "",
  badgeClass: "",
  badgeColorClass: "",
  childrenContainerClass: "",
  childBtnClass: "",
  childHoverClass: "",
  childFocusClass: "",
  childActiveClass: "",
  config: undefined,
});

const refKeyboardConfig = inject<Readonly<Ref<VirtualKeyboardConfig>>>(
  prefix("refConfig")
);
const refConfig = computed<VirtualKeyboardConfig>(() => ({
  ...useDefaultConfig(),
  ...refKeyboardConfig?.value,
  ...props.config,
}));

const emitClicked = inject<EmitKeyPressedFunction>(prefix("emitKeyPressed"));
const changePage = inject<ChangePageFunction>(prefix("changePage"));
const shiftKeyboard = inject<ShiftKeyboardFunction>(prefix("shiftKeyboard"));

const handleClick = (value: string) => {
  if (props.pageButton) {
    changePage?.(value);
  } else if (value == "__SHIFT__") {
    shiftKeyboard?.();
  } else {
    emitClicked?.(value);
  }
};

const refIsMounted = ref(false);
onMounted(() => {
  refIsMounted.value = true;
});

const refIsMouseover = ref(false);
const refIsMousedown = ref(false);
const handleMouseenter = (evt: MouseEvent) => {
  refIsMouseover.value = true;
  if (evt.buttons == 0) {
    refIsMousedown.value = false;
  }
};
const handleMouseleave = () => {
  refIsMouseover.value = false;
};

const handleMousedown = (evt: MouseEvent) => {
  if (evt.buttons == 1) {
    refIsMousedown.value = true;
  }
};
const handleMouseup = () => {
  if (refIsMousedown.value) {
    handleClick(refPrimaryBtn.value.value);
  }
  refIsMousedown.value = false;
};

const refIsFocused = ref(false);
const handleFocusin = () => {
  refIsFocused.value = true;
};
const handleFocusout = () => {
  refIsFocused.value = false;
  refIsMousedown.value = false;
};

const refMouseoverChildBtn: Ref<string | undefined> = ref(undefined);
const refMousedownChildBtn: Ref<string | undefined> = ref(undefined);
const handleMouseenterChild = (value: string, evt: MouseEvent) => {
  refMouseoverChildBtn.value = value;
  if (evt.buttons == 0) {
    refMousedownChildBtn.value = undefined;
  }
};
const handleMouseleaveChild = () => {
  refMouseoverChildBtn.value = undefined;
};
const handleMousedownChild = (value: string, evt: MouseEvent) => {
  if (evt.buttons == 1) {
    refMousedownChildBtn.value = value;
  }
  refIsMousedown.value = false;
};
const handleMouseupChild = () => {
  refMousedownChildBtn.value = undefined;
};

const refFocusedChildBtn: Ref<string | undefined> = ref(undefined);
const handleFocusinChild = (value: string, evt: FocusEvent) => {
  refFocusedChildBtn.value = value;
};
const handleFocusoutChild = () => {
  refFocusedChildBtn.value = undefined;
};

const refIsTouching = ref(false);
const reactiveChildrenXAxis: Record<string, { left: number; right: number }> =
  reactive({});
const refTouchmoveChildBtn = ref("");
const handleTouchstart = () => {
  refIsTouching.value = true;
  refTouchmoveChildBtn.value = refPrimaryBtn.value.value;
};
const handleTouchmove = (evt: TouchEvent) => {
  if (refIsChildrenVisible.value) {
    refTouchmoveChildBtn.value =
      Object.keys(reactiveChildrenXAxis).find((value) => {
        const { left, right } = reactiveChildrenXAxis[value],
          x = evt.changedTouches[0].clientX;
        return left <= x && right >= x;
      }) || "";
  }
};
const handleTouchend = () => {
  refIsTouching.value = false;
  handleClick(refTouchmoveChildBtn.value);
  refTouchmoveChildBtn.value = "";
};
const refIsChildrenVisible = computed(() => {
  return (
    refChildrenBtns.value.length > 0 &&
    (refIsMouseover.value || refIsTouching.value)
  );
});

const refTouchableDevice = ref(false);
watch(refIsMouseover, () => (refTouchableDevice.value = false));
watch(refIsTouching, () => (refTouchableDevice.value = true));

const parseButtonType: (btn: string | ButtonType) => SlotedButtonType = (btn) =>
  typeof btn == "string"
    ? { value: btn, slotName: btn }
    : { ...btn, slotName: btn.value };
const refIsShifted = inject<Readonly<Ref<boolean>>>(prefix("refIsShifted"));
const refCurrentPage = inject<Readonly<Ref<string>>>(prefix("refCurrentPage"));
const defaultBtn: SlotedButtonType = {
  value: props.value,
  label: props.label,
  slotName: "default",
};
const refChildrenBtns = computed(() => {
  const filtered: string[] = [props.value];
  return props.children
    .map<SlotedButtonType>((child) => parseButtonType(child))
    .filter((child) => {
      if (filtered.includes(child.value)) {
        return false;
      } else {
        filtered.push(child.value);
        return true;
      }
    });
});
const refPrimaryBtn = computed<SlotedButtonType>(() => {
  if (props.pageButton) {
    return (
      refChildrenBtns.value.find(
        (child) => child.value == refCurrentPage?.value
      ) || defaultBtn
    );
  } else if (refIsShifted?.value && props.children[props.shiftIndex]) {
    const shiftChild = parseButtonType(props.children[props.shiftIndex]);
    if (shiftChild.value !== props.value) {
      return shiftChild;
    }
  }
  return defaultBtn;
});
const refVisibleChildrenBtns = computed(() => {
  const children = refChildrenBtns.value.filter(
    (child) => child.value !== refPrimaryBtn.value.value
  );
  if (refPrimaryBtn.value.value != props.value) {
    children.unshift(defaultBtn);
  }
  if (refTouchableDevice.value && children.length > 0) {
    children.unshift(refPrimaryBtn.value);
  }
  return children;
});

const observer = new IntersectionObserver((entries) => {
  if (refIsChildrenVisible.value) {
    entries.forEach((entry) => {
      reactiveChildrenXAxis[
        (entry.target as HTMLButtonElement).dataset.vkBtnValue || ""
      ] = {
        left: entry.boundingClientRect.left,
        right: entry.boundingClientRect.right,
      };
    });
  }
});
watch(
  [refVisibleChildrenBtns, refIsMounted],
  ([children, isMounted]) => {
    if (!isMounted) {
      return;
    }
    observer.disconnect();
    if (!children.length) {
      return;
    }
    /* DOM will be changed in next tick, so we should call `observe` after that. */
    nextTick(() => {
      if (!refChildrenContainerEle.value) {
        return;
      }
      for (const ele of refChildrenContainerEle.value.children) {
        observer.observe(ele);
      }
    });
  },
  { immediate: true }
);
onUnmounted(() => {
  observer.disconnect();
});

const refChildrenPositionStyle: Ref<{ left?: string; top?: string }> = ref({});
const refReverseChildren = ref(false);
watch(
  [refVisibleChildrenBtns, refIsChildrenVisible, refIsMounted],
  ([children, isVisible, isMounted]) => {
    if (!isMounted || !isVisible || !children.length) {
      return;
    }
    /* DOM will be changed in next tick, so we should call `computePosition` after that. */
    nextTick(() => {
      if (!refIsChildrenVisible.value) {
        return;
      }
      computePosition(refButtonEle.value, refChildrenContainerEle.value, {
        middleware: [
          offset({ ...refConfig.value.childrenContainerOffset }),
          placeChildren(),
        ],
      }).then((result) => {
        refReverseChildren.value = result.middlewareData.placeChildren.reversed;
        refChildrenPositionStyle.value = {
          left: `${result.x}px`,
          top: `${result.y}px`,
        };
      });
    });
  },
  { immediate: true }
);

const attrs = useAttrs();
const refBtnClass = computed(() =>
  attrs.class ? "" : props.btnClass || refConfig.value.buttonClass?.btn
);
const refBtnHoverClass = computed(
  () => props.hoverClass || refConfig.value.buttonClass?.hover || ""
);
const refBtnActiveClass = computed(
  () => props.activeClass || refConfig.value.buttonClass?.active || ""
);
const refBtnFocusClass = computed(
  () => props.focusClass || refConfig.value.buttonClass?.focus || ""
);
const refBadgeClasses = computed(() => [
  props.badgeClass || refConfig.value.buttonClass?.badge,
  props.badgeColorClass || refConfig.value.buttonClass?.badgeColor,
]);
const refChildrenContainerClass = computed(
  () =>
    props.childrenContainerClass || refConfig.value.childrenContainerClass || ""
);
const refChildBtnClass = computed(
  () =>
    props.childBtnClass ||
    refConfig.value.childButtonClass?.btn ||
    refBtnClass.value ||
    attrs.class
);
const refChildBtnHoverClass = computed(
  () =>
    props.childHoverClass ||
    refConfig.value.childButtonClass?.hover ||
    refBtnHoverClass.value
);
const refChildBtnActiveClass = computed(
  () =>
    props.childActiveClass ||
    refConfig.value.childButtonClass?.active ||
    refBtnActiveClass.value
);
const refChildBtnFocusClass = computed(
  () =>
    props.childFocusClass ||
    refConfig.value.childButtonClass?.focus ||
    refBtnFocusClass.value
);
</script>
