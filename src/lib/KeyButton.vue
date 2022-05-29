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
    @click="handleClick(value)"
    @mouseover="handleMouseover"
    @mouseout="handleMouseout"
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
        !refIsChildrenVisible &&
        !refConfig.hideHasChildrenBadge &&
        refChildrenBtns.length > 0
      "
      :class="refBadgeClasses"
    ></div>
    <slot>
      {{ label || value }}
    </slot>
    <template v-if="refChildrenBtns.length > 0">
      <div
        v-show="refIsChildrenVisible"
        ref="refChildrenContainerEle"
        :class="[
          refChildrenContainerClass,
          { 'flex-row-reverse': refReverseChildren },
        ]"
        :style="refChildrenPositionStyle"
      >
        <button
          v-for="child of refChildrenBtns"
          :key="child.value"
          ref="refChildrenEles"
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
          <slot :name="child.value">{{ child.label || child.value }}</slot>
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
const refChildrenEles = ref([]);

type ButtonType = {
  value: string;
  label?: string;
};

/* Vue 3.2 defineProps does not support union type ? */
/* type PropsType = ButtonType & { */
type PropsType = {
  value: string;
  label?: string;
  children?: (ButtonType | string)[];
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
  pageButton: false,
  btnClass: "w-fit min-w-[2rem] h-fit min-h-[2rem] p-4 rounded bg-gray-300",
  hoverClass: "bg-blue-400",
  focusClass: "",
  activeClass: "bg-blue-500",
  badgeClass:
    "absolute top-0 right-0 w-0 h-0 rounded-tr border-l-transparent border-b-transparent border-[6px]",
  badgeColorClass: "border-blue-400",
  childrenContainerClass: "absolute w-fit flex gap-1 p-1 box-content",
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

const refChildrenBtns = computed(() => {
  const filtered: string[] = [props.value];
  return props.children
    .map<ButtonType>((child) =>
      typeof child == "string" ? { value: child } : child
    )
    .filter((child) => {
      if (filtered.includes(child.value)) {
        return false;
      } else {
        filtered.push(child.value);
        return true;
      }
    });
});

const reactiveChildrenX: Record<string, { left: number; right: number }> =
  reactive({});
const refTouchmoveChildBtn = ref("");
const observer = new IntersectionObserver((entries) => {
  if (refIsChildrenVisible.value) {
    entries.forEach((entry) => {
      reactiveChildrenX[
        (entry.target as HTMLButtonElement).dataset.vkBtnValue || ""
      ] = {
        left: entry.boundingClientRect.left,
        right: entry.boundingClientRect.right,
      };
    });
  }
});
onMounted(() => {
  refChildrenEles.value.forEach((ele: HTMLElement) => {
    observer.observe(ele);
  });
});
onUnmounted(() => {
  observer.disconnect();
});

const refIsHover = ref(false);
const handleMouseover = () => {
  refIsHover.value = true;
};
const handleMouseout = () => {
  refIsHover.value = false;
};

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
  refIsMousedown.value = false;
};

const refIsFocused = ref(false);
const handleFocusin = () => {
  refIsFocused.value = true;
};
const handleFocusout = () => {
  refIsFocused.value = false;
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
const handleTouchstart = () => {
  refIsTouching.value = true;
  refTouchmoveChildBtn.value = props.value;
};
const handleTouchmove = (evt: TouchEvent) => {
  if (refIsChildrenVisible.value) {
    refTouchmoveChildBtn.value =
      Object.keys(reactiveChildrenX).find((value) => {
        const { left, right } = reactiveChildrenX[value],
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
    (refIsHover.value || refIsTouching.value)
  );
});

const refChildrenPositionStyle: Ref<{ left?: string; top?: string }> = ref({});
const refReverseChildren = ref(false);
watch(
  [refChildrenBtns, refIsChildrenVisible, refIsMounted],
  ([children, isVisible, isMounted]) => {
    if (!isMounted || !isVisible || !children.length) {
      return;
    }
    computePosition(refButtonEle.value, refChildrenContainerEle.value, {
      middleware: [
        offset({ alignmentAxis: refConfig.value.childrenXOffset || -4 }),
        placeChildren(),
      ],
    }).then((result) => {
      refReverseChildren.value = result.middlewareData.placeChildren.reversed;
      refChildrenPositionStyle.value = {
        left: `${result.x}px`,
        top: `${result.y}px`,
      };
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
    props.hoverClass ||
    refConfig.value.childButtonClass?.hover ||
    ""
);
const refChildBtnActiveClass = computed(
  () =>
    props.childActiveClass ||
    props.activeClass ||
    refConfig.value.childButtonClass?.active ||
    ""
);
const refChildBtnFocusClass = computed(
  () =>
    props.childFocusClass ||
    props.focusClass ||
    refConfig.value.childButtonClass?.focus ||
    ""
);
</script>
