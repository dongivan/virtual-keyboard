<template>
  <button
    v-bind="$attrs"
    ref="refButtonEle"
    class="relative select-none"
    :class="[refBtnClass, refStateClasses]"
    @click="handleClick(value)"
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
        !isChildButton &&
        !refIsChildrenVisible &&
        !config?.hideHasChildrenBadge &&
        refActuallyChildren.length > 0
      "
      :class="refBadgeClasses"
    ></div>
    <slot>
      {{ label || value }}
    </slot>
  </button>
  <template v-if="!isChildButton">
    <div
      v-show="refIsChildrenVisible"
      ref="refChildrenEle"
      class="absolute w-fit flex gap-1 p-1 box-content"
      :class="{ 'flex-row-reverse': refReverseChildren }"
      :style="refChildrenStyle"
      @mouseenter="handleMouseenter"
      @mouseleave="handleMouseleave"
    >
      <slot name="children"></slot>
    </div>
  </template>
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
  onMounted,
  onUnmounted,
  provide,
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
  RegisterChildButtonFunction,
  VirtualKeyboardConfig,
  UpdateChildButtonRectFunction,
} from "./typings";
import { computePosition } from "@floating-ui/dom";
import { prefix } from "./utils";

const refButtonEle = ref();
const refChildrenEle = ref();

const props = defineProps({
  value: { type: String, required: true },
  label: { type: String, default: "" },
  pageButton: { type: Boolean, default: false },
  btnClass: {
    type: String,
    default: "w-fit min-w-[2rem] h-fit min-h-[2rem] p-4 rounded bg-gray-300",
  },
  hoverClass: { type: String, default: "bg-blue-400" },
  focusClass: { type: String, default: "focus" },
  activeClass: { type: String, default: "bg-blue-500" },
  badgeClass: {
    type: String,
    default:
      "absolute top-0 right-0 w-0 h-0 rounded-tr border-l-transparent border-b-transparent border-[6px]",
  },
  badgeColorClass: {
    type: String,
    default: "border-blue-400",
  },
});
const config = inject<VirtualKeyboardConfig>(prefix("config"));

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

const isChildButton = inject<boolean>(prefix("isChildButton"));
const reactiveChildrenX: Record<string, { left: number; right: number }> =
  reactive({});
const refChildren = ref([] as string[]);
const refCurrentButton = ref("");
provide(prefix("isChildButton"), true);
if (isChildButton) {
  const updateChildRect = inject<UpdateChildButtonRectFunction>(
    prefix("updateChildRect")
  );
  const observer = new IntersectionObserver((entries) => {
    const { intersectionRatio, boundingClientRect } = entries[0];
    if (intersectionRatio) {
      updateChildRect?.(props.value, boundingClientRect);
    }
  });
  onMounted(() => {
    observer.observe(refButtonEle.value);
  });
  onUnmounted(() => {
    observer.disconnect();
  });
  const registerChildButton = inject<RegisterChildButtonFunction>(
    "registerChildButton"
  );
  registerChildButton?.(props.value);
} else {
  provide<RegisterChildButtonFunction>("registerChildButton", (value) => {
    if (!refChildren.value.includes(value)) {
      refChildren.value.push(value);
    }
  });
  provide<UpdateChildButtonRectFunction>(
    prefix("updateChildRect"),
    (value, rect) => {
      reactiveChildrenX[value] = { left: rect.left, right: rect.right };
      console.log("update child rect", reactiveChildrenX);
    }
  );
  provide("refCurrentButton", refCurrentButton);
}
const refParentCurrentButton = isChildButton
  ? inject<Ref<string>>("refCurrentButton")
  : ref("");

const refIsMouseover = ref(false);
const refIsMousedown = ref(false);
const handleMouseenter = (evt: MouseEvent) => {
  refIsMouseover.value = true;
  if (!evt.buttons) {
    refIsMousedown.value = false;
  }
};
const handleMouseleave = () => {
  refIsMouseover.value = false;
};
const handleMousedown = () => {
  refIsMousedown.value = true;
};
const handleMouseup = () => {
  refIsMousedown.value = false;
};

const refIsFocusing = ref(false);
const handleFocusin = () => {
  refIsFocusing.value = true;
};
const handleFocusout = () => {
  refIsFocusing.value = false;
};

const refIsTouching = ref(false);
const handleTouchstart = () => {
  refIsTouching.value = true;
  refCurrentButton.value = props.value;
};
const handleTouchmove = (evt: TouchEvent) => {
  if (refActuallyChildren.value.length > 0) {
    refCurrentButton.value =
      Object.keys(reactiveChildrenX).find((value) => {
        const { left, right } = reactiveChildrenX[value],
          x = evt.changedTouches[0].clientX;
        return left <= x && right >= x;
      }) || "";
  }
};
const handleTouchend = () => {
  refIsTouching.value = false;
  handleClick(refCurrentButton.value);
  refCurrentButton.value = "";
};
const refIsHover = computed(() => {
  return refIsMouseover.value;
});
const refIsActive = computed(() => {
  return (
    refIsTouching.value ||
    (refIsMouseover.value && refIsMousedown.value) ||
    refParentCurrentButton?.value == props.value
  );
});

const refActuallyChildren = computed(() => {
  return refChildren.value.filter((val) => val !== props.value);
});
const refIsChildrenVisible = computed(() => {
  return (
    refActuallyChildren.value.length > 0 &&
    (refIsHover.value || refIsTouching.value)
  );
});

const refChildrenStyle: Ref<{ left?: string; top?: string }> = ref({});
const refReverseChildren = ref(false);
watch(
  [refActuallyChildren, refIsChildrenVisible, refIsMounted],
  ([children, isVisible, isMounted]) => {
    if (!isMounted || !isVisible || !children.length) {
      return;
    }
    computePosition(refButtonEle.value, refChildrenEle.value, {
      middleware: [
        offset({ alignmentAxis: config?.childrenXOffset || -4 }),
        placeChildren(),
      ],
    }).then((result) => {
      refReverseChildren.value = result.middlewareData.placeChildren.reversed;
      refChildrenStyle.value = { left: `${result.x}px`, top: `${result.y}px` };
    });
  },
  { immediate: true }
);

const attrs = useAttrs();
const refBtnClass = computed(() => {
  return attrs.class ? "" : props.btnClass || config?.buttonClass?.btn;
});
const refStateClasses = computed(() => {
  return {
    [props.hoverClass || config?.buttonClass?.hover || ""]: refIsHover.value,
    [props.activeClass || config?.buttonClass?.active || ""]: refIsActive.value,
    [props.focusClass || config?.buttonClass?.focus || ""]: refIsFocusing.value,
  };
});
const refBadgeClasses = computed(() => {
  return [
    props.badgeClass || config?.buttonClass?.badge,
    props.badgeColorClass || config?.buttonClass?.badgeColor,
  ];
});
</script>
