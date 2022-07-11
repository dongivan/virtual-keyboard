<template>
  <button
    ref="refButtonEle"
    class="vk-btn-default"
    :class="refBtnCss"
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
        props.children.length > 0 &&
        !refIsChildrenVisible &&
        props.badge != 'hide'
      "
      :class="refBadgeCss"
    >
      <slot v-if="refBadgeType == 'slot'" name="badge">
        <slot
          v-if="props.children[0] !== undefined"
          :name="slot(props.children[0])"
        ></slot>
      </slot>
    </div>
    <slot :name="slot(props.primary)"></slot>
    <template v-if="refVisibleChildren.length > 0">
      <div
        v-show="refIsChildrenVisible"
        class="vk-btn-bridge"
        :style="refChildrenBridgeStyle"
      ></div>
      <div
        v-show="refIsChildrenVisible"
        ref="refChildrenContainerEle"
        class="vk-btn-children-container"
        :class="[
          refChildrenContainerCss,
          { 'flex-row-reverse': refReverseChildren },
        ]"
        :style="refChildrenPositionStyle"
      >
        <button
          v-for="child of refVisibleChildren"
          :key="child"
          ref="refChildrenBtnEles"
          :class="refChildrenBtnCss(child)"
          :data-vk-btn-value="child"
          @click.stop="handleClick(child, false)"
          @mouseenter="handleMouseenterChild(child, $event)"
          @mouseleave="handleMouseleaveChild"
          @mousedown.stop="handleMousedownChild(child, $event)"
          @mouseup.stop="handleMouseupChild"
          @focusin.stop="handleFocusinChild(child, $event)"
          @focusout.stop="handleFocusoutChild"
        >
          <slot :name="slot(child)"></slot>
        </button>
      </div>
    </template>
  </button>
</template>

<script lang="ts">
import { detectOverflow, Middleware, offset } from "@floating-ui/dom";
export default {};

type BadgeType = {
  common?: string;
  hide?: string;
  triangle?: string;
  slot?: string;
};
type ButtonType = {
  common?: string;
  default?: string;
  active?: string;
  hover?: string;
  focus?: string;
};
type GenericButtonType = ButtonType & {
  badge?: BadgeType;
  children?: ButtonType & {
    container?: string;
  };
};

const deepAssign: (
  o: Record<string, unknown>,
  p: Record<string, unknown>
) => Record<string, unknown> = (o, p) => {
  Object.keys(p).forEach((k) => {
    if (typeof p[k] == "object") {
      if (typeof o[k] !== "object") {
        o[k] = {};
      }
      deepAssign(
        o[k] as Record<string, unknown>,
        p[k] as Record<string, unknown>
      );
    } else {
      o[k] = p[k];
    }
  });
  return o;
};

const parseButtonCss: (css: GenericButtonType) => GenericButtonType = (css) => {
  return deepAssign(
    {
      common: "vk-btn",
      default: "default",
      active: "active",
      hover: "hover",
      focus: "focus",
      badge: {
        common: "vk-btn-badge",
        hide: "hide",
        triangle: "triangle",
        slot: "slot",
      },
      children: {
        container: "vk-btn-children",
      },
    },
    css
  ) as GenericButtonType;
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
  useSlots,
  watch,
} from "vue";
import { EmitKeyPressedFunction } from "./typings";
import { computePosition } from "@floating-ui/dom";
import { prefix, slot } from "./utils";

const refButtonEle = ref();
const refChildrenContainerEle = ref();
const refChildrenBtnEles = ref([]);

type PropsType = {
  primary: string;
  children?: string[];
  active?: boolean;
  badge?: "auto" | "hide" | "triangle" | "slot";
  css?: GenericButtonType;
  childrenOffset?: {
    alignmentAxis: number;
    mainAxis: number;
    crossAxis: number;
  };
};
const props = withDefaults(defineProps<PropsType>(), {
  children: () => [],
  active: false,
  badge: "auto",
  css: () => {
    return parseButtonCss({});
  },
  childrenOffset: () => ({
    alignmentAxis: 0,
    crossAxis: 0,
    mainAxis: 2,
  }),
});

const parsedCss = parseButtonCss(props.css);

const emitClicked = inject<EmitKeyPressedFunction>(prefix("emitKeyPressed"));

const handleClick = (value: string, isPrimary: boolean) => {
  emitClicked?.(value, { isPrimary, targetValue: value });
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
    handleClick(props.primary, true);
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

const refMouseoverChild: Ref<string | undefined> = ref(undefined);
const refMousedownChild: Ref<string | undefined> = ref(undefined);
const handleMouseenterChild = (value: string, evt: MouseEvent) => {
  refMouseoverChild.value = value;
  if (evt.buttons == 0) {
    refMousedownChild.value = undefined;
  }
};
const handleMouseleaveChild = () => {
  refMouseoverChild.value = undefined;
};
const handleMousedownChild = (value: string, evt: MouseEvent) => {
  if (evt.buttons == 1) {
    refMousedownChild.value = value;
  }
  refIsMousedown.value = false;
};
const handleMouseupChild = () => {
  refMousedownChild.value = undefined;
  refIsMouseover.value = false;
};

const refFocusedChild: Ref<string | undefined> = ref(undefined);
const handleFocusinChild = (value: string, evt: FocusEvent) => {
  refFocusedChild.value = value;
};
const handleFocusoutChild = () => {
  refFocusedChild.value = undefined;
};

const refIsTouching = ref(false);
const reactiveChildrenXAxis = reactive<
  Record<string, { left: number; right: number }>
>({});
const refTouchmoveChild = ref("");
const handleTouchstart = () => {
  refIsTouching.value = true;
};
const handleTouchmove = (evt: TouchEvent) => {
  if (refIsChildrenVisible.value) {
    refTouchmoveChild.value =
      Object.keys(reactiveChildrenXAxis).find((value) => {
        const { left, right } = reactiveChildrenXAxis[value],
          x = evt.changedTouches[0].clientX;
        return left <= x && right >= x;
      }) || "";
  }
};
const handleTouchend = () => {
  refIsTouching.value = false;
  handleClick(
    refTouchmoveChild.value || props.primary,
    refTouchmoveChild.value ? false : true
  );
  refTouchmoveChild.value = "";
};
const refIsChildrenVisible = computed(
  () =>
    props.children.length > 0 && (refIsMouseover.value || refIsTouching.value)
);

const refTouchableDevice = ref(false);
watch(refIsMouseover, () => (refTouchableDevice.value = false));
watch(refIsTouching, () => (refTouchableDevice.value = true));

const refVisibleChildren = computed(() => {
  const children = props.children;
  return refTouchableDevice.value && children.length > 0
    ? [props.primary, ...children]
    : children;
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
  [refVisibleChildren, refIsMounted],
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
  [refVisibleChildren, refIsChildrenVisible, refIsMounted],
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
        middleware: [offset({ ...props.childrenOffset }), placeChildren()],
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

const slots = useSlots();
const refBtnCss = computed(() => {
  const css = [parsedCss.common];
  if (refIsMouseover.value) {
    if (refIsMousedown.value) {
      css.push(parsedCss.active);
    } else {
      css.push(parsedCss.hover);
    }
  } else if (refIsFocused.value) {
    css.push(parsedCss.focus);
  } else if (refIsTouching.value || props.active) {
    css.push(parsedCss.active);
  } else {
    css.push(parsedCss.default);
  }
  return css.join(" ");
});
const refChildrenBtnCss = computed(() => {
  return (child: string): string => {
    const css = [parsedCss.children.common || parsedCss.common];
    if (refMouseoverChild.value == child) {
      if (refMousedownChild.value == child) {
        css.push(parsedCss.children.active || parsedCss.active);
      } else {
        css.push(parsedCss.children.hover || parsedCss.hover);
      }
    } else if (refFocusedChild.value == child) {
      css.push(parsedCss.children.focus || parsedCss.focus);
    } else if (refTouchmoveChild.value == child) {
      css.push(parsedCss.children.active || parsedCss.active);
    } else {
      css.push(parsedCss.children.default || parsedCss.default);
    }
    return css.join(" ");
  };
});
const refBadgeType = computed(() =>
  props.badge == "auto"
    ? !!slots.badge || props.children.length == 1
      ? "slot"
      : "triangle"
    : props.badge
);
const refBadgeCss = computed(() => [
  parsedCss.badge.common,
  parsedCss.badge[refBadgeType.value],
]);
const refChildrenContainerCss = computed(() => parsedCss.children.container);

const refChildrenBridgeStyle = computed(() => {
  const height = props.childrenOffset.mainAxis || 0;
  return {
    height: `calc(50% + ${height}px)`,
    top: `calc(-25% - ${height}px)`,
  };
});
</script>

<style scoped>
.vk-btn-default {
  @apply relative select-none;
}
.vk-btn-bridge {
  @apply absolute bg-transparent w-full left-0;
}
.vk-btn-children-container {
  @apply absolute;
}
</style>
