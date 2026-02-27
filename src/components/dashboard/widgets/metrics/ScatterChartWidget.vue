<script>
/** Default and minimum grid size for this widget. Used by the grid view when not specified. */
export const gridDefaults = { w: 2, h: 2, minW: 1, minH: 2 };

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: "Scatter Chart",
  description: "Displays a scatter chart for numeric x/y points.",
  icon: "fa-solid fa-braille",
  group: "Charts",
};

/** Full property metadata for ScatterChartWidget. */
export const PROP_SCHEMA = {
  uniqueName: {
    type: "string",
    default: "",
    control: "text",
    label: "Unique Name",
    description: "Identifier for the widget, used for layout and data binding.",
  },
  description: {
    type: "string",
    default: "",
    control: "text",
    label: "Description",
    description: "Optional description or notes for the widget.",
  },

  // Card title (shown above chart)
  title: {
    type: "string",
    default: "Scatter Chart",
    control: "text",
    label: "Title",
    description: "Text label displayed above the chart.",
  },
  showTitle: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Title",
    description: "Whether to show or hide the title.",
  },
  titleFontColor: {
    type: "string",
    default: "#6c757d",
    control: "colorPure",
    label: "Font color",
    description: "Text color for the title.",
  },
  titleFontFamily: {
    type: "string",
    default: "inherit",
    control: "font",
    label: "Font family",
    description: "Font family for the title.",
  },
  titleFontSize: {
    type: "number",
    default: 14,
    control: "number",
    label: "Font Size (px)",
    min: 8,
    max: 72,
    step: 1,
    description: "Font size for the title in pixels.",
  },
  titleVerticalAlignment: {
    type: "string",
    default: "top",
    control: "select",
    options: ["top", "bottom"],
    label: "Vertical Alignment",
    description: "Vertical position of the title (top or bottom).",
  },
  titleHorizontalAlignment: {
    type: "string",
    default: "center",
    control: "select",
    options: ["left", "center", "right"],
    label: "Horizontal Alignment",
    description: "Horizontal alignment of the title (left, center, right).",
  },

  // Data: "x,y;x,y;..."
  points: {
    type: "string",
    default: "0,10;1,20;2,15",
    control: "text",
    label: "Points (x,y; x,y; ...)",
    description: "Data points as x,y pairs separated by semicolons. Example: 0,10;1,20;2,15",
  },

  // Appearance / behaviour
  pointBackgroundColor: {
    type: "string",
    default: "#0d6efd",
    control: "colorPure",
    label: "Point Color",
    description: "Background color of the scatter point markers.",
  },
  pointRadius: {
    type: "number",
    default: 4,
    control: "number",
    label: "Point Radius",
    min: 1,
    max: 20,
    step: 1,
    description: "Radius of each scatter point in pixels.",
  },

  // Legend
  legendDisplay: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Legend",
    description: "Whether to show the legend.",
  },
  legendPosition: {
    type: "string",
    default: "top",
    control: "select",
    options: ["top", "right", "bottom", "left"],
    label: "Position",
    description: "Position of the legend (top, right, bottom, left).",
  },
  legendFontColor: {
    type: "string",
    default: "#6c757d",
    control: "colorPure",
    label: "Font color",
    description: "Text color for the legend.",
  },
  legendFontFamily: {
    type: "string",
    default: "inherit",
    control: "font",
    label: "Font family",
    description: "Font family for the legend.",
  },
  legendFontSize: {
    type: "number",
    default: 12,
    control: "number",
    label: "Font Size (px)",
    min: 8,
    max: 32,
    step: 1,
    description: "Font size for the legend in pixels.",
  },

  tooltipsEnabled: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Tooltips",
    description: "Whether to show tooltips on hover.",
  },
  fillCell: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Fill Cell",
    description: "Whether the chart expands to fill available space.",
  },
  verticalAlignment: {
    type: "string",
    default: "center",
    control: "select",
    options: ["top", "center", "bottom"],
    label: "Vertical Alignment",
    description: "Vertical alignment of chart content within the card.",
  },
  maintainAspectRatio: {
    type: "boolean",
    default: false,
    control: "switch",
    label: "Maintain Aspect Ratio",
    description: "Whether the chart maintains its aspect ratio when resized.",
  },

  // Card visual + layout
  backgroundColor: {
    type: "string",
    default: "",
    control: "colorBoth",
    label: "Background Color",
    description: "Background color of the card. Supports solid colors and gradients.",
  },
  borderLeftColor: {
    type: "string",
    default: "orange",
    control: "colorPure",
    label: "Border Left",
    description: "Color of the left border.",
  },
  borderTopColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Top",
    description: "Color of the top border.",
  },
  borderRightColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Right",
    description: "Color of the right border.",
  },
  borderBottomColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Bottom",
    description: "Color of the bottom border.",
  },
  cardPaddingAll: {
    type: "number",
    default: 0.5,
    control: "number",
    label: "Padding All (rem)",
    min: 0.0,
    max: 5,
    step: 0.1,
    description: "Internal padding of the card in rem.",
  },
};

/** Prop names grouped by category. */
export const CONFIGURABLE_PROPS_BY_GROUP = {
  general: ["uniqueName", "title", "description"],
  title: [
    "showTitle",
    "titleFontColor",
    "titleFontFamily",
    "titleFontSize",
    "titleVerticalAlignment",
    "titleHorizontalAlignment",
  ],
  data: ["points"],
  legend: [
    "legendDisplay",
    "legendPosition",
    "legendFontColor",
    "legendFontFamily",
    "legendFontSize",
  ],
  chart: [
    "pointBackgroundColor",
    "pointRadius",
    "tooltipsEnabled",
    "fillCell",
    "verticalAlignment",
    "maintainAspectRatio",
  ],
  card: [
    "backgroundColor",
    "borderLeftColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "cardPaddingAll",
  ],
};

/** Builds property schema for PropertyGridWidget from widget props. */
export function buildPropertySchema(props = {}) {
  const children = Object.entries(CONFIGURABLE_PROPS_BY_GROUP).map(
    ([groupName, keys]) => ({
      label: groupName.charAt(0).toUpperCase() + groupName.slice(1),
      children: keys
        .filter((key) => PROP_SCHEMA[key])
        .map((key) => {
          const schema = PROP_SCHEMA[key];
          const current = props[key];
          const value =
            current === undefined || current === null
              ? schema.default
              : current;
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
            description: schema.description ?? null,
            children: [],
          };
        }),
    }),
  );

  return {
    label: `Scatter Chart Settings`,
    children,
  };
}
</script>

<script setup>
import { computed, inject } from "vue";
import { Scatter } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale);

const props = defineProps({
  openPropertyEditor: { type: Function, default: null },
  removeWidget: { type: Function, default: null },
  editMode: { type: Boolean, default: false },
  uniqueName: { type: String, default: "" },
  description: { type: String, default: "" },

  title: { type: String, default: "Scatter Chart" },
  titleFontColor: { type: String, default: "#6c757d" },
  titleFontFamily: { type: String, default: "inherit" },
  titleFontSize: {
    type: [Number, String],
    default: 14,
  },
  showTitle: { type: [Boolean, String], default: true },
  titleVerticalAlignment: {
    type: String,
    default: "top",
    validator: (v) => ["top", "bottom"].includes(v),
  },
  titleHorizontalAlignment: {
    type: String,
    default: "center",
    validator: (v) => ["left", "center", "right"].includes(v),
  },

  backgroundColor: { type: String, default: "" },
  borderLeftColor: { type: String, default: "orange" },
  borderTopColor: { type: String, default: "" },
  borderRightColor: { type: String, default: "" },
  borderBottomColor: { type: String, default: "" },
  cardPaddingAll: { type: [Number, String], default: 0.5 },

  points: { type: String, default: "0,10;1,20;2,15" },

  pointBackgroundColor: { type: String, default: "#0d6efd" },
  pointRadius: { type: [Number, String], default: 4 },

  legendDisplay: { type: [Boolean, String], default: true },
  legendPosition: { type: String, default: "top" },
  legendFontColor: { type: String, default: "#6c757d" },
  legendFontFamily: { type: String, default: "inherit" },
  legendFontSize: { type: [Number, String], default: 12 },
  tooltipsEnabled: { type: [Boolean, String], default: true },
  fillCell: { type: [Boolean, String], default: true },
  verticalAlignment: { type: String, default: "center" },
  maintainAspectRatio: { type: [Boolean, String], default: false },
});

const cardStyle = computed(() => {
  const style = {
    maxHeight: "100%",
    height: "100%",
    overflow: "hidden",
    minHeight: 0,
  };

  if (props.backgroundColor) {
    const bg = props.backgroundColor.trim();
    if (/^linear-gradient\(|^radial-gradient\(/i.test(bg))
      style.background = bg;
    else style.backgroundColor = bg;
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

const titleClass = computed(() => []);
const titleStyle = computed(() => {
  const s = {};
  if (props.titleFontFamily) s.fontFamily = props.titleFontFamily;
  if (props.titleFontColor) s.color = props.titleFontColor;

  s.fontSize = `${asNumber(props.titleFontSize, 14)}px`;

  if (props.titleHorizontalAlignment === "left") s.textAlign = "left";
  else if (props.titleHorizontalAlignment === "right") s.textAlign = "right";
  else s.textAlign = "center";

  s.width = "100%";

  return s;
});

const selfAlignmentStyle = computed(() => ({
  alignSelf: "center",
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
}));

const contentAlignmentStyle = computed(() => {
  const vertical = props.verticalAlignment || "center";
  let justifyContent = "center";
  if (vertical === "top") justifyContent = "flex-start";
  else if (vertical === "bottom") justifyContent = "flex-end";

  return {
    justifyContent,
    alignItems: "center",
    width: "100%",
    height: "100%",
    minHeight: 0,
    padding: `${Number(props.cardPaddingAll) || 0}rem`,
  };
});

const asBool = (v, fallback = false) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const lower = v.toLowerCase().trim();
    if (lower === "true") return true;
    if (lower === "false") return false;
  }
  return fallback;
};

const asNumber = (v, fallback = 0) => {
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
};

function parsePointsString(str) {
  return String(str || "")
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [xs, ys] = pair.split(",").map((s) => s.trim());
      const x = Number(xs);
      const y = Number(ys);
      if (Number.isNaN(x) || Number.isNaN(y)) return null;
      return { x, y };
    })
    .filter((p) => p != null);
}

const parsedPoints = computed(() => parsePointsString(props.points));

const showTitleBool = computed(() => asBool(props.showTitle, true));
const maintainAspectRatioValue = computed(() =>
  asBool(props.maintainAspectRatio, false),
);
const legendFontSizeKey = computed(() => asNumber(props.legendFontSize, 12));

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

const chartData = computed(() => ({
  datasets: [
    {
      label: props.title || "Dataset",
      data: parsedPoints.value,
      backgroundColor: props.pointBackgroundColor || "#0d6efd",
      pointRadius: asNumber(props.pointRadius, 4),
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: maintainAspectRatioValue.value,
  maintainAspectRatio: asBool(props.maintainAspectRatio, false),
  plugins: {
    legend: {
      display: asBool(props.legendDisplay, true),
      position: props.legendPosition || "top",
      labels: {
        color: props.legendFontColor || undefined,
        font: {
          size: asNumber(props.legendFontSize, 12),
          family: props.legendFontFamily || undefined,
        },
      },
    },
    title: {
      display: false,
    },
    tooltip: { enabled: asBool(props.tooltipsEnabled, true) },
  },
}));
</script>

<template>
  <div
    class="card h-100 d-flex flex-column position-relative"
    :class="{ 'edit-mode': editMode }"
    :style="cardStyle"
    :role="openPropertyEditor ? 'button' : undefined"
    tabindex="0"
    @dblclick.stop
  >
    <div
      v-if="editMode"
      class="widget-actions btn-group btn-group-sm"
      role="group"
      @click.stop
    >
      <button
        v-if="removeWidget"
        type="button"
        class="btn btn-outline-danger btn-sm"
        title="Delete"
        @click.stop="removeWidget"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        title="Settings"
        @click.stop="onClick"
      >
        <i class="fa-solid fa-gear"></i>
      </button>
    </div>
    <div class="card-body d-flex flex-column" :style="contentAlignmentStyle">
      <div
        v-if="showTitleBool && title && titleVerticalAlignment === 'top'"
        class="mb-2"
        :class="titleClass"
        :style="titleStyle"
      >
        {{ title }}
      </div>

      <div
        class="chart-wrap"
        :class="{ 'flex-grow-1': fillCellBool }"
        :style="selfAlignmentStyle"
      >
        <Scatter
          :data="chartData"
          :options="chartOptions"
          :key="`${maintainAspectRatioValue ? 'ma-1' : 'ma-0'}-lfs-${legendFontSizeKey}`"
        />
      </div>

      <div
        v-if="showTitleBool && title && titleVerticalAlignment === 'bottom'"
        class="mt-2"
        :class="titleClass"
        :style="titleStyle"
      >
        {{ title }}
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

.widget-actions {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}
.card.edit-mode:hover .widget-actions {
  opacity: 1;
  pointer-events: auto;
}
.widget-actions .btn {
  padding: 0.15rem 0.35rem;
  font-size: 0.7rem;
}

.chart-wrap {
  height: auto;
  max-height: 100%;
}
</style>
