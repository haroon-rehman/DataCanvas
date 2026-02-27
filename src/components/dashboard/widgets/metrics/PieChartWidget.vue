<script>
/** Default and minimum grid size for this widget. Used by the grid view when not specified. */
export const gridDefaults = { w: 2, h: 2, minW: 1, minH: 2 };

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: "Pie Chart",
  description: "Displays a pie chart for categorical metrics.",
  icon: "fa-solid fa-chart-pie",
  group: "Charts",
};

/** Full property metadata for TempPieWidget (pie‑chart focused). */
export const PROP_SCHEMA = {
  uniqueName: {
    type: "string",
    default: "",
    control: "text",
    label: "Unique Name",
    description: "Unique identifier for this widget (used for data binding and scripting)",
  },
  description: {
    type: "string",
    default: "",
    control: "text",
    label: "Description",
    description: "Optional description or notes for this widget",
  },

  // Card title (shown above chart)
  title: {
    type: "string",
    default: "Pie Chart",
    control: "text",
    label: "Title",
    description: "Chart title text",
  },
  showTitle: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Title",
    description: "Whether to show the chart title",
  },
  titleFontColor: {
    type: "string",
    default: "#6c757d",
    control: "colorPure",
    label: "Font color",
    description: "Title font color",
  },
  titleFontFamily: {
    type: "string",
    default: "inherit",
    control: "font",
    label: "Font family",
    description: "Title font family",
  },
  titleFontSize: {
    type: "number",
    default: 14,
    control: "number",
    label: "Font Size (px)",
    min: 8,
    max: 72,
    step: 1,
    description: "Title font size",
  },
  titleVerticalAlignment: {
    type: "string",
    default: "top",
    control: "select",
    options: ["top", "bottom"],
    label: "Vertical Alignment",
    description: "Title vertical alignment",
  },
  titleHorizontalAlignment: {
    type: "string",
    default: "center",
    control: "select",
    options: ["left", "center", "right"],
    label: "Horizontal Alignment",
    description: "Title horizontal alignment",
  },

  // Pie data
  labels: {
    type: "string",
    default: "Open,In Progress,Closed",
    control: "text",
    label: "Slice Labels (Comma Separated)",
    description: "Comma-separated data for chart",
  },
  values: {
    type: "string",
    default: "12,7,21",
    control: "text",
    label: "Slice Values (Comma Separated)",
    description: "Comma-separated data for chart",
  },
  colors: {
    type: "string",
    default: "#4e79a7,#f28e2b,#59a14f",
    control: "text",
    label: "Slice Colors (Comma Separated)",
    description: "Comma-separated data for chart",
  },

  // Pie appearance / behaviour (subset of real PieChartWidget)
  sliceBorderWidth: {
    type: "number",
    default: 0,
    control: "number",
    label: "Slice Border Width (px)",
    min: 0,
    max: 10,
    step: 1,
    description: "Slice border styling",
  },
  sliceBorderColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Slice Border Color",
    description: "Slice border styling",
  },
  fillCell: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Fill Cell",
    description: "Whether chart fills the cell",
  },
  verticalAlignment: {
    type: "string",
    default: "center",
    control: "select",
    options: ["top", "center", "bottom"],
    label: "Vertical Alignment",
    description: "Chart vertical alignment",
  },
  maintainAspectRatio: {
    type: "boolean",
    default: false,
    control: "switch",
    label: "Maintain Aspect Ratio",
    description: "Whether to maintain chart aspect ratio",
  },

  // Legend
  legendDisplay: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Legend",
    description: "Legend settings",
  },
  legendPosition: {
    type: "string",
    default: "bottom",
    control: "select",
    options: ["top", "right", "bottom", "left"],
    label: "Position",
    description: "Legend settings",
  },
  legendFontColor: {
    type: "string",
    default: "#6c757d",
    control: "colorPure",
    label: "Font color",
    description: "Legend settings",
  },
  legendFontFamily: {
    type: "string",
    default: "inherit",
    control: "font",
    label: "Font family",
    description: "Legend settings",
  },
  legendFontSize: {
    type: "number",
    default: 12,
    control: "number",
    label: "Font Size (px)",
    min: 8,
    max: 32,
    step: 1,
    description: "Legend settings",
  },
  tooltipsEnabled: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Tooltips",
    description: "Show chart tooltips on hover",
  },

  // Card visual + layout
  backgroundColor: {
    type: "string",
    default: "",
    control: "colorBoth",
    label: "Background Color",
    description: "Background color or gradient for the widget card",
  },
  borderLeftColor: {
    type: "string",
    default: "orange",
    control: "colorPure",
    label: "Border Left",
    description: "Border colors",
  },
  borderTopColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Top",
    description: "Border colors",
  },
  borderRightColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Right",
    description: "Border colors",
  },
  borderBottomColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Bottom",
    description: "Border colors",
  },
  cardPaddingAll: {
    type: "number",
    default: 0.5,
    control: "number",
    label: "Padding All (rem)",
    min: 0.0,
    max: 5,
    step: 0.1,
    description: "Uniform padding in rem",
  },
};

/** Prop names grouped by category. */
const CONFIGURABLE_PROPS_BY_GROUP = {
  general: ["uniqueName", "title", "description"],
  title: [
    "showTitle",
    "titleFontColor",
    "titleFontFamily",
    "titleFontSize",
    "titleVerticalAlignment",
    "titleHorizontalAlignment",
  ],
  data: ["labels", "values", "colors"],
  legend: [
    "legendDisplay",
    "legendPosition",
    "legendFontColor",
    "legendFontFamily",
    "legendFontSize",
  ],
  chart: [
    "sliceBorderWidth",
    "sliceBorderColor",
    "fillCell",
    "verticalAlignment",
    "maintainAspectRatio",
    "tooltipsEnabled",
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
            children: [],
            description: schema.description ?? null,
          };
        }),
    }),
  );

  return {
    label: `Pie Chart Settings`,
    children,
  };
}
</script>

<script setup>
import { computed, inject } from "vue";
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  openPropertyEditor: { type: Function, default: null },
  removeWidget: { type: Function, default: null },
  editMode: { type: Boolean, default: false },
  uniqueName: { type: String, default: "" },
  description: { type: String, default: "" },

  title: { type: String, default: "Pie Chart" },
  showTitle: { type: [Boolean, String], default: true },
  titleFontColor: { type: String, default: "#6c757d" },
  titleFontFamily: { type: String, default: "inherit" },
  titleFontSize: {
    type: [Number, String],
    default: 14,
  },
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

  // Pie‑chart specific props
  labels: { type: String, default: "Open,In Progress,Closed" },
  values: { type: String, default: "12,7,21" },
  colors: { type: String, default: "#4e79a7,#f28e2b,#59a14f" },

  sliceBorderWidth: { type: [Number, String], default: 0 },
  sliceBorderColor: { type: String, default: "" },
  fillCell: { type: [Boolean, String], default: true },
  verticalAlignment: {
    type: String,
    default: "center",
    validator: (v) => ["top", "center", "bottom"].includes(v),
  },
  maintainAspectRatio: { type: [Boolean, String], default: false },
  legendDisplay: { type: [Boolean, String], default: true },
  legendPosition: { type: String, default: "bottom" },
  legendFontColor: { type: String, default: "#6c757d" },
  legendFontFamily: { type: String, default: "inherit" },
  legendFontSize: { type: [Number, String], default: 12 },
  tooltipsEnabled: { type: [Boolean, String], default: true },
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

const parsedLabels = computed(() =>
  String(props.labels || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const parsedValues = computed(() =>
  String(props.values || "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n)),
);

const parsedColors = computed(() =>
  String(props.colors || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const showTitleBool = computed(() => asBool(props.showTitle, true));
const maintainAspectRatioValue = computed(() =>
  asBool(props.maintainAspectRatio, false),
);
const fillCellBool = computed(() => asBool(props.fillCell, false));
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

const chartData = computed(() => {
  const labels = parsedLabels.value;
  const values = parsedValues.value;
  if (!labels.length || !values.length) {
    return { labels: [], datasets: [] };
  }
  const dataValues =
    values.length === labels.length
      ? values
      : labels.map((_, i) => values[i] ?? 0);
  const colors = parsedColors.value;
  const bgColors = dataValues.map((_, i) => colors[i] || "#4e79a7");

  return {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: bgColors,
        borderWidth: asNumber(props.sliceBorderWidth, 0),
        borderColor: props.sliceBorderColor || undefined,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: maintainAspectRatioValue.value,
  plugins: {
    legend: {
      display: asBool(props.legendDisplay, true),
      position: props.legendPosition || "bottom",
      labels: {
        color: props.legendFontColor || undefined,
        font: {
          size: asNumber(props.legendFontSize, 12),
          family: props.legendFontFamily || undefined,
        },
      },
    },
    title: { display: false },
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
        <Pie
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
