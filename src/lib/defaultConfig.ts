import { VirtualKeyboardConfig } from "./typings";

const defaultConfig: VirtualKeyboardConfig = {
  pageClass: "flex gap-1 flex-wrap",
  buttonClass: {
    btn: "w-fit min-w-[2rem] h-fit min-h-[2rem] p-2 rounded bg-gray-200",
    active: "bg-gray-400",
    hover: "bg-gray-300",
    focus: "ring-2 ring-gray-100",
    badge: [
      "w-0 h-0 rounded-tr border-[6px] border-transparent border-t-blue-400 border-r-blue-400",
    ],
    slotBadge: [
      "min-w-[50%] min-h-min scale-75 origin-top-right text-gray-600",
    ],
  },
  childrenContainerClass:
    "min-w-full w-max flex gap-1 p-1 border border-gray-400 rounded-md bg-gray-100",
  childButtonClass: {},
  childrenContainerOffset: {
    alignmentAxis: 0,
    mainAxis: 2,
  },
};

export default defaultConfig;
