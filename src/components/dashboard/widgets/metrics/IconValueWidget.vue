<script>
/** Default and minimum grid size for this widget. Used by the grid view when not specified. */
export const gridDefaults = { w: 2, h: 2, minW: 1, minH: 1 };

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: "Icon & Value",
  shortName: "IconValue",
  description:
    "Displays a label, icon, and value (e.g. metric or KPI) with configurable colors and fonts.",
  icon: "fa-solid fa-chart-simple",
  group: "Metrics",
};

/** Full property metadata for IconValueWidget. */
export const PROP_SCHEMA = {
  uniqueName: {
    type: "string",
    default: "",
    control: "text",
    label: "Unique Name",
  },
  label: { type: "string", default: "", control: "text", label: "Label" },
  description: {
    type: "string",
    default: "",
    control: "text",
    label: "Description",
  },
  labelFontColor: {
    type: "string",
    default: "#6c757d",
    control: "colorPure",
    label: "Font Color",
  },
  labelFontFamily: {
    type: "string",
    default: "inherit",
    control: "font",
    label: "Font Family",
  },
  labelFontSizePx: {
    type: "number",
    default: 14,
    control: "number",
    label: "Font Size (px)",
    min: 8,
    max: 72,
    step: 1,
  },
  labelFontStyle: {
    type: "array",
    default: () => [],
    control: "fontStyle",
    options: ["B", "U", "I", "S"],
    label: "Font Style",
  },
  labelHorizontalAlignment: {
    type: "string",
    default: "Center",
    control: "select",
    options: ["Start", "Center", "End"],
    label: "Horizontal Alignment",
  },
  labelVerticalAlignment: {
    type: "string",
    default: "End",
    control: "select",
    options: ["Start", "Center", "End"],
    label: "Vertical Alignment",
  },
  icon: {
    type: "string",
    default: "fa-solid fa-chart-simple",
    control: "text",
    label: "Icon",
  },
  iconColor: {
    type: "string",
    default: "orange",
    control: "colorPure",
    label: "Color",
  },
  iconSizePx: {
    type: "number",
    default: 48,
    control: "number",
    label: "Size (px)",
    min: 12,
    max: 128,
    step: 1,
  },
  iconHorizontalAlignment: {
    type: "string",
    default: "Center",
    control: "select",
    options: ["Start", "Center", "End"],
    label: "Horizontal Alignment",
  },
  iconAnimation: {
    type: "string",
    default: "",
    control: "select",
    options: [
      "",
      "Beat",
      "Beat-Fade",
      "Bounce",
      "Fade",
      "Flip-Horizontal",
      "Flip-Vertical",
      "Pulse",
      "Shake",
      "Spin",
      "Spin-Pulse",
      "Spin-Reverse",
    ],
    label: "Animation Style",
  },
  iconAnimationSpeed: {
    type: "string",
    default: "Normal",
    control: "select",
    options: ["Faster", "Fast", "Normal", "Slow", "Slower"],
    label: "Animation Speed",
  },
  iconAnimationDirection: {
    type: "string",
    default: "Normal",
    control: "select",
    options: ["Normal", "Reverse", "Alternate", "Alternate-Reverse"],
    label: "Animation Direction",
  },
  backgroundColor: {
    type: "string",
    default: "",
    control: "colorBoth",
    label: "Background Color",
  },
  borderLeftColor: {
    type: "string",
    default: "orange",
    control: "colorPure",
    label: "Border Left",
  },
  borderTopColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Top",
  },
  borderRightColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Right",
  },
  borderBottomColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Bottom",
  },
  cardPaddingAll: {
    type: "number",
    default: 0.5,
    control: "number",
    label: "Padding All (rem)",
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  value: { type: "string", default: "--", control: "text", label: "Value" },
  valueFontColor: {
    type: "string",
    default: "inherit",
    control: "colorPure",
    label: "Font Color",
  },
  valueFontFamily: {
    type: "string",
    default: "inherit",
    control: "font",
    label: "Font Family",
  },
  valueFontSizePx: {
    type: "number",
    default: 24,
    control: "number",
    label: "Font Size (px)",
    min: 12,
    max: 72,
    step: 1,
  },
  valueFontStyle: {
    type: "array",
    default: () => [],
    control: "fontStyle",
    options: ["B", "U", "I", "S"],
    label: "Font Style",
  },
  valueHorizontalAlignment: {
    type: "string",
    default: "Center",
    control: "select",
    options: ["Start", "Center", "End"],
    label: "Horizontal Alignment",
  },
  valueVerticalAlignment: {
    type: "string",
    default: "Center",
    control: "select",
    options: ["Start", "Center", "End"],
    label: "Vertical Alignment",
  },
};

/** Prop names grouped by category. */
const CONFIGURABLE_PROPS_BY_GROUP = {
  general: ["uniqueName", "label", "description", "icon", "value"],
  labelAppearance: [
    "labelFontColor",
    "labelFontFamily",
    "labelFontSizePx",
    "labelFontStyle",
    "labelHorizontalAlignment",
    "labelVerticalAlignment",
  ],
  iconAppearance: [
    "iconColor",
    "iconSizePx",
    "iconHorizontalAlignment",
    "iconAnimation",
    "iconAnimationSpeed",
    "iconAnimationDirection",
  ],
  cardAppearance: [
    "backgroundColor",
    "borderLeftColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "cardPaddingAll",
  ],
  valueAppearance: [
    "valueFontColor",
    "valueFontFamily",
    "valueFontSizePx",
    "valueFontStyle",
    "valueHorizontalAlignment",
    "valueVerticalAlignment",
  ],
};

/** Normalize select value to Title case option when options exist (for backward compat with lowercase). */
function normalizeSelectValue(val, options) {
  if (val == null || val === "" || !Array.isArray(options) || !options.length)
    return val;
  const lower = String(val).toLowerCase();
  const match = options.find((opt) => String(opt).toLowerCase() === lower);
  return match ?? val;
}

/** Convert legacy string size values to pixels for backward compat. */
const LEGACY_LABEL_SIZE_PX = {
  small: 14,
  "fs-6": 16,
  "fs-5": 20,
  "fs-4": 24,
  "fs-3": 28,
};
const LEGACY_VALUE_SIZE_PX = {
  "fs-1": 40,
  "fs-2": 32,
  "fs-3": 28,
  "fs-4": 24,
  "fs-5": 20,
  "fs-6": 16,
};
const LEGACY_ICON_SIZE_PX = {
  "fa-1x": 16,
  "fa-2x": 32,
  "fa-3x": 48,
  "fa-4x": 64,
  "fa-5x": 80,
  "fa-lg": 20,
  "fa-sm": 14,
};
function parseLegacySizeToPx(val, map) {
  if (val == null || val === "") return null;
  const key = String(val).toLowerCase();
  if (map[key] != null) return map[key];
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

/** Build CSS object from font style array (B=bold, U=underline, I=italic, S=strikethrough). */
function fontStyleToCss(arr) {
  if (!Array.isArray(arr) || !arr.length) return {};
  const s = {};
  if (arr.includes("B")) s.fontWeight = "bold";
  if (arr.includes("I")) s.fontStyle = "italic";
  const deco = [];
  if (arr.includes("U")) deco.push("underline");
  if (arr.includes("S")) deco.push("line-through");
  if (deco.length) s.textDecoration = deco.join(" ");
  return s;
}

/** Builds property schema for PropertyGridWidget from widget props. */
export function buildPropertySchema(props = {}) {
  const children = Object.entries(CONFIGURABLE_PROPS_BY_GROUP).map(
    ([groupName, keys]) => ({
      label: groupName.charAt(0).toUpperCase() + groupName.slice(1),
      children: keys
        .filter((key) => PROP_SCHEMA[key])
        .map((key) => {
          const schema = PROP_SCHEMA[key];
          let value = props[key];
          if (value === undefined || value === null) {
            if (key === "labelFontSizePx")
              value = parseLegacySizeToPx(
                props.labelFontSize,
                LEGACY_LABEL_SIZE_PX,
              );
            else if (key === "iconSizePx")
              value = parseLegacySizeToPx(props.iconSize, LEGACY_ICON_SIZE_PX);
            else if (key === "valueFontSizePx")
              value = parseLegacySizeToPx(
                props.valueFontSize,
                LEGACY_VALUE_SIZE_PX,
              );
            value = value ?? schema.default;
          }
          if (schema.control === "fontStyle") {
            if (Array.isArray(value)) value = value;
            else if (typeof value === "string" && String(value).trim())
              value = String(value)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            else value = schema.default ?? [];
          } else if (schema.options)
            value = normalizeSelectValue(value, schema.options);
          return {
            key,
            label: schema.label ?? key,
            value,
            type: schema.type,
            default: schema.default,
            control: schema.control ?? "text",
            options: schema.options ?? null,
            min: schema.min,
            max: schema.max,
            step: schema.step,
            children: [],
          };
        }),
    }),
  );
  return {
    label: `Icon & Value Settings`,
    children,
  };
}
</script>

<script setup>
import { computed, inject } from "vue";

const props = defineProps({
  /** Optional; overrides inject. Receives (propertySchema, opts?) where opts.update = (key, value) => void */
  openPropertyEditor: { type: Function, default: null },
  editMode: { type: Boolean, default: false },
  uniqueName: { type: String, default: "" },
  identifier: { type: String, default: "" },
  value: { type: [String, Number], default: "--" },
  label: { type: String, default: "" },
  icon: { type: String, default: "fa-solid fa-chart-simple" },
  backgroundColor: { type: String, default: "" },
  borderLeftColor: { type: String, default: "orange" },
  borderTopColor: { type: String, default: "" },
  borderRightColor: { type: String, default: "" },
  borderBottomColor: { type: String, default: "" },
  cardPaddingAll: { type: [Number, String], default: 0.5 },
  iconColor: { type: String, default: "orange" },
  iconSizePx: { type: Number, default: 48 },
  iconSize: { type: [String, Number], default: undefined },
  valueFontColor: { type: String, default: "inherit" },
  valueFontFamily: { type: String, default: "inherit" },
  valueFontSizePx: { type: Number, default: 24 },
  valueFontSize: { type: [String, Number], default: undefined },
  labelFontColor: { type: String, default: "#6c757d" },
  labelFontFamily: { type: String, default: "inherit" },
  labelFontSizePx: { type: Number, default: 14 },
  labelFontSize: { type: [String, Number], default: undefined },
  labelFontStyle: { type: Array, default: () => [] },
  valueFontStyle: { type: Array, default: () => [] },
  valueHorizontalAlignment: {
    type: String,
    default: "Center",
    validator: (v) =>
      ["Start", "Center", "End", "start", "center", "end"].includes(v),
  },
  valueVerticalAlignment: {
    type: String,
    default: "Center",
    validator: (v) =>
      ["Start", "Center", "End", "start", "center", "end"].includes(v),
  },
  labelHorizontalAlignment: {
    type: String,
    default: "Center",
    validator: (v) =>
      ["Start", "Center", "End", "start", "center", "end"].includes(v),
  },
  labelVerticalAlignment: {
    type: String,
    default: "End",
    validator: (v) =>
      ["Start", "Center", "End", "start", "center", "end"].includes(v),
  },
  iconHorizontalAlignment: {
    type: String,
    default: "Center",
    validator: (v) =>
      ["Start", "Center", "End", "start", "center", "end"].includes(v),
  },
  iconAnimation: {
    type: String,
    default: "",
    validator: (v) =>
      [
        "",
        "Beat",
        "Beat-Fade",
        "Bounce",
        "Fade",
        "Flip-Horizontal",
        "Flip-Vertical",
        "Pulse",
        "Shake",
        "Spin",
        "Spin-Pulse",
        "Spin-Reverse",
        "beat",
        "beat-fade",
        "bounce",
        "fade",
        "flip-horizontal",
        "flip-vertical",
        "pulse",
        "shake",
        "spin",
        "spin-pulse",
        "spin-reverse",
      ].includes(v),
  },
  iconAnimationSpeed: {
    type: String,
    default: "Normal",
    validator: (v) =>
      [
        "Faster",
        "Fast",
        "Normal",
        "Slow",
        "Slower",
        "faster",
        "fast",
        "normal",
        "slow",
        "slower",
      ].includes(v),
  },
  iconAnimationDirection: {
    type: String,
    default: "Normal",
    validator: (v) =>
      [
        "Normal",
        "Reverse",
        "Alternate",
        "Alternate-Reverse",
        "normal",
        "reverse",
        "alternate",
        "alternate-reverse",
      ].includes(v),
  },
});

const bodyClasses = computed(() => ["card-body", "d-flex", "flex-column"]);

const effectiveLabelFontSizePx = computed(() => {
  const n = Number(props.labelFontSizePx);
  if (Number.isFinite(n) && n > 0) return n;
  return parseLegacySizeToPx(props.labelFontSize, LEGACY_LABEL_SIZE_PX) ?? 14;
});
const effectiveValueFontSizePx = computed(() => {
  const n = Number(props.valueFontSizePx);
  if (Number.isFinite(n) && n > 0) return n;
  return parseLegacySizeToPx(props.valueFontSize, LEGACY_VALUE_SIZE_PX) ?? 24;
});
const effectiveIconSizePx = computed(() => {
  const n = Number(props.iconSizePx);
  if (Number.isFinite(n) && n > 0) return n;
  return parseLegacySizeToPx(props.iconSize, LEGACY_ICON_SIZE_PX) ?? 48;
});

const iconClasses = computed(() => {
  const iconStr = (props.icon || "").trim();
  const parts = iconStr ? iconStr.split(/\s+/).filter(Boolean) : [];
  if (!parts.length) parts.push("fa-solid", "fa-chart-simple");
  else if (parts.length === 1 && parts[0].startsWith("fa-"))
    parts.unshift("fa-solid");
  const c = [...parts, "mb-0"];
  if (props.iconAnimation) {
    const anim = (props.iconAnimation || "").toLowerCase();
    const isFlip =
      anim === "flip" || anim === "flip-horizontal" || anim === "flip-vertical";
    c.push(isFlip ? "fa-flip" : `fa-${anim}`);
  }
  return c;
});

const animationDurationMap = {
  Faster: "0.5s",
  Fast: "0.75s",
  Normal: "1s",
  Slow: "1.5s",
  Slower: "2s",
  faster: "0.5s",
  fast: "0.75s",
  normal: "1s",
  slow: "1.5s",
  slower: "2s",
};
const animationDirectionMap = {
  Normal: "normal",
  Reverse: "reverse",
  Alternate: "alternate",
  "Alternate-Reverse": "alternate-reverse",
  normal: "normal",
  reverse: "reverse",
  alternate: "alternate",
  "alternate-reverse": "alternate-reverse",
};
const iconStyle = computed(() => {
  const style = {
    color: props.iconColor,
    fontSize: `${effectiveIconSizePx.value}px`,
  };
  if (props.iconAnimation && props.iconAnimationSpeed) {
    style.animationDuration =
      animationDurationMap[props.iconAnimationSpeed] || "1s";
  }
  if (props.iconAnimation && props.iconAnimationDirection) {
    style.animationDirection =
      animationDirectionMap[props.iconAnimationDirection] ??
      String(props.iconAnimationDirection).toLowerCase();
  }
  const anim = (props.iconAnimation || "").toLowerCase();
  if (anim === "flip" || anim === "flip-horizontal") {
    style["--fa-flip-x"] = 1;
    style["--fa-flip-y"] = 0;
  } else if (anim === "flip-vertical") {
    style["--fa-flip-x"] = 0;
    style["--fa-flip-y"] = 1;
  }
  return style;
});

const cardStyle = computed(() => {
  const style = {
    maxHeight: "100%",
    overflow: "hidden",
    minHeight: 0,
  };
  if (props.backgroundColor) {
    if (
      /^linear-gradient\(|^radial-gradient\(/i.test(
        props.backgroundColor.trim(),
      )
    ) {
      style.background = props.backgroundColor;
    } else {
      style.backgroundColor = props.backgroundColor;
    }
  }
  const width = "3px solid ";
  if (props.borderLeftColor) style.borderLeft = width + props.borderLeftColor;
  if (props.borderTopColor) style.borderTop = width + props.borderTopColor;
  if (props.borderRightColor)
    style.borderRight = width + props.borderRightColor;
  if (props.borderBottomColor)
    style.borderBottom = width + props.borderBottomColor;
  return style;
});

const valueAlignmentClass = computed(
  () => `text-${(props.valueHorizontalAlignment || "").toLowerCase()}`,
);
const valueVerticalAlignmentStyle = computed(() => {
  const v = (props.valueVerticalAlignment || "Center").toLowerCase();
  if (v === "end") return { marginTop: "auto" };
  if (v === "center") return { marginTop: "auto", marginBottom: "auto" };
  return {};
});
const labelAlignmentClass = computed(
  () => `text-${(props.labelHorizontalAlignment || "").toLowerCase()}`,
);
const labelVerticalAlignmentStyle = computed(() => {
  const v = (props.labelVerticalAlignment || "End").toLowerCase();
  if (v === "end") return { marginTop: "auto" };
  if (v === "center") return { marginTop: "auto", marginBottom: "auto" };
  return {};
});
const iconAlignmentClass = computed(
  () => `align-self-${(props.iconHorizontalAlignment || "").toLowerCase()}`,
);

const selfAlignmentStyle = computed(() => ({
  alignSelf: "flex-start",
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
}));

const contentAlignmentStyle = computed(() => ({
  justifyContent: "flex-start",
  alignItems: "flex-start",
  width: "100%",
  height: "100%",
  minHeight: 0,
  padding: `${Number(props.cardPaddingAll) || 0.5}rem`,
}));

const valueStyle = computed(() => {
  const s = {
    fontSize: `${effectiveValueFontSizePx.value}px`,
    ...fontStyleToCss(props.valueFontStyle),
  };
  if (props.valueFontFamily) s.fontFamily = props.valueFontFamily;
  if (props.valueFontColor) s.color = props.valueFontColor;
  return s;
});
const labelStyle = computed(() => {
  const s = {
    fontSize: `${effectiveLabelFontSizePx.value}px`,
    ...fontStyleToCss(props.labelFontStyle),
  };
  if (props.labelFontFamily) s.fontFamily = props.labelFontFamily;
  if (props.labelFontColor) s.color = props.labelFontColor;
  return s;
});

const injectedOpenPropertyEditor = inject("openPropertyEditor", null);
const openPropertyEditor = computed(
  () => props.openPropertyEditor ?? injectedOpenPropertyEditor,
);
function buildPropertySchemaFromProps() {
  return buildPropertySchema(props);
}
function onClick() {
  const fn = openPropertyEditor.value;
  if (fn) fn(buildPropertySchemaFromProps());
}
</script>

<template>
  <div
    class="card h-100"
    :class="{ 'edit-mode': editMode }"
    :style="{ ...cardStyle, ...selfAlignmentStyle }"
    role="button"
    tabindex="0"
    @dblclick.stop="onClick"
    @keydown.enter.prevent="onClick"
  >
    <div :class="bodyClasses" :style="contentAlignmentStyle">
      <i
        :class="[iconClasses, iconAlignmentClass]"
        class="icon flex-shrink-0"
        :style="iconStyle"
        aria-hidden="true"
      />
      <div class="d-flex flex-column min-w-0 flex-grow-1 w-100">
        <p
          class="icon-value mb-0"
          :class="valueAlignmentClass"
          :style="{ ...valueStyle, ...valueVerticalAlignmentStyle }"
        >
          {{ value }}
        </p>
        <p
          v-if="label"
          class="icon-label text-muted mb-0"
          :class="labelAlignmentClass"
          :style="{ ...labelStyle, ...labelVerticalAlignmentStyle }"
        >
          {{ label }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card[role="button"] {
  cursor: default;
}
.card[role="button"].edit-mode {
  cursor: pointer;
}
</style>
