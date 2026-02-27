<script>
import IconValueWidget from "../metrics/IconValueWidget.vue";
import ValueWidget from "../metrics/ValueWidget.vue";
import PieChartWidget from "../metrics/PieChartWidget.vue";
import BarChartWidget from "../metrics/BarChartWidget.vue";
import RadarChartWidget from "../metrics/RadarChartWidget.vue";
import DoughnutChartWidget from "../metrics/DoughnutChartWidget.vue";
import HeatmapChartWidget from "../metrics/HeatmapChartWidget.vue";
import LineChartWidget from "../metrics/LineChartWidget.vue";
import PolarAreaChartWidget from "../metrics/PolarAreaChartWidget.vue";
import ScatterChartWidget from "../metrics/ScatterChartWidget.vue";
import AudioPlayerWidget from "../media/AudioPlayerWidget.vue";
import VideoPlayerWidget from "../media/VideoPlayerWidget.vue";
import {
  gridDefaults as iconValueGridDefaults,
  widgetMeta as iconValueWidgetMeta,
} from "../metrics/IconValueWidget.vue";
import {
  gridDefaults as valueGridDefaults,
  widgetMeta as valueWidgetMeta,
} from "../metrics/ValueWidget.vue";
import {
  gridDefaults as pieChartGridDefaults,
  widgetMeta as pieChartWidgetMeta,
} from "../metrics/PieChartWidget.vue";
import {
  gridDefaults as barChartGridDefaults,
  widgetMeta as barChartWidgetMeta,
} from "../metrics/BarChartWidget.vue";
import {
  gridDefaults as radarChartGridDefaults,
  widgetMeta as radarChartWidgetMeta,
} from "../metrics/RadarChartWidget.vue";
import {
  gridDefaults as doughnutChartGridDefaults,
  widgetMeta as doughnutChartWidgetMeta,
} from "../metrics/DoughnutChartWidget.vue";
import {
  gridDefaults as heatmapChartGridDefaults,
  widgetMeta as heatmapChartWidgetMeta,
} from "../metrics/HeatmapChartWidget.vue";
import {
  gridDefaults as lineChartGridDefaults,
  widgetMeta as lineChartWidgetMeta,
} from "../metrics/LineChartWidget.vue";
import {
  gridDefaults as polarAreaChartGridDefaults,
  widgetMeta as polarAreaChartWidgetMeta,
} from "../metrics/PolarAreaChartWidget.vue";
import {
  gridDefaults as scatterChartGridDefaults,
  widgetMeta as scatterChartWidgetMeta,
} from "../metrics/ScatterChartWidget.vue";
import {
  gridDefaults as audioPlayerGridDefaults,
  widgetMeta as audioPlayerWidgetMeta,
} from "../media/AudioPlayerWidget.vue";
import {
  gridDefaults as videoPlayerGridDefaults,
  widgetMeta as videoPlayerWidgetMeta,
} from "../media/VideoPlayerWidget.vue";
import {
  collectIconValueUniqueNames,
  generateUniqueIconValueName,
} from "../../../../utils/widgetUniqueNameUtils.js";
import { generateWidgetIdentifier } from "../../_internals/widgetIdentifierCounter.js";

/** Default grid size when this widget is used inside a layout. */
export const gridDefaults = { w: 2, h: 2, minW: 1, minH: 1 };

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: "Grid Layout",
  description: "A grid of nested widgets with drag-and-drop layout.",
  icon: "fa-solid fa-th",
  group: "Layout",
};

/** Full property metadata for GridLayoutWidget. */
export const PROP_SCHEMA = {
  identifier: {
    type: "string",
    default: "",
    control: "text",
    label: "Identifier",
    description: "Unique identifier for the grid layout",
  },
  label: {
    type: "string",
    default: "",
    control: "text",
    label: "Label",
    description: "Display label for the grid",
  },
  description: {
    type: "string",
    default: "",
    control: "text",
    label: "Description",
    description: "Optional description or notes",
  },
  rows: {
    type: "number",
    default: 12,
    control: "number",
    label: "Row Count",
    description: "Number of grid rows",
  },
  columns: {
    type: "number",
    default: 12,
    control: "number",
    label: "Column Count",
    description: "Number of grid columns",
  },
  cellHeightPx: {
    type: "number",
    default: 70,
    control: "number",
    label: "Cell Height (px)",
    description: "Height of each grid cell in pixels",
  },
  cellWidthPx: {
    type: "number",
    default: 120,
    control: "number",
    label: "Cell Width (px)",
    description: "Width of each grid cell in pixels",
  },
  sizeMode: {
    type: "string",
    default: "Computed",
    control: "select",
    options: ["Auto", "Computed"],
    label: "Size Mode",
    description: "How grid size is computed (Auto or Computed)",
  },
  backgroundColor: {
    type: "string",
    default: "",
    control: "colorBoth",
    label: "Background Colour",
    description: "Background color or gradient",
  },
  foregroundColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Foreground Colour",
    description: "Foreground color",
  },
};

/** Prop names grouped by category. */
const CONFIGURABLE_PROPS_BY_GROUP = {
  general: ["label", "description"],
  grid: ["rows", "columns", "cellHeightPx", "cellWidthPx", "sizeMode"],
  appearance: ["backgroundColor", "foregroundColor"],
};

/** Builds property schema for PropertyGridWidget from widget props. */
export function buildPropertySchema(props = {}) {
  const displayLabel = "Dashboard Settings";
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
            description: schema.description ?? null,
            children: [],
          };
        }),
    }),
  );
  return {
    label: displayLabel,
    children,
  };
}

/** Allowed child widget types: type name -> component. Only these are rendered as grid items. Also used as default widgetComponents. */
export const ALLOWED_CHILD_TYPES = {
  IconValueWidget,
  ValueWidget,
  PieChartWidget,
  BarChartWidget,
  RadarChartWidget,
  DoughnutChartWidget,
  HeatmapChartWidget,
  LineChartWidget,
  PolarAreaChartWidget,
  ScatterChartWidget,
  AudioPlayerWidget,
  VideoPlayerWidget,
};

/** Default grid defaults when not provided. */
export const DEFAULT_GRID_DEFAULTS_BY_TYPE = {
  IconValueWidget: iconValueGridDefaults,
  ValueWidget: valueGridDefaults,
  PieChartWidget: pieChartGridDefaults,
  BarChartWidget: barChartGridDefaults,
  RadarChartWidget: radarChartGridDefaults,
  DoughnutChartWidget: doughnutChartGridDefaults,
  HeatmapChartWidget: heatmapChartGridDefaults,
  LineChartWidget: lineChartGridDefaults,
  PolarAreaChartWidget: polarAreaChartGridDefaults,
  ScatterChartWidget: scatterChartGridDefaults,
  AudioPlayerWidget: audioPlayerGridDefaults,
  VideoPlayerWidget: videoPlayerGridDefaults,
};

/** Registry of allowed child widgets for the selector: { type, friendlyName, description, icon, group }. */
const WIDGET_REGISTRY = [
  { type: "IconValueWidget", ...iconValueWidgetMeta },
  { type: "ValueWidget", ...valueWidgetMeta },
  { type: "PieChartWidget", ...pieChartWidgetMeta },
  { type: "BarChartWidget", ...barChartWidgetMeta },
  { type: "RadarChartWidget", ...radarChartWidgetMeta },
  { type: "DoughnutChartWidget", ...doughnutChartWidgetMeta },
  { type: "HeatmapChartWidget", ...heatmapChartWidgetMeta },
  { type: "LineChartWidget", ...lineChartWidgetMeta },
  { type: "PolarAreaChartWidget", ...polarAreaChartWidgetMeta },
  { type: "ScatterChartWidget", ...scatterChartWidgetMeta },
  { type: "AudioPlayerWidget", ...audioPlayerWidgetMeta },
  { type: "VideoPlayerWidget", ...videoPlayerWidgetMeta },
];
</script>
<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
  inject,
  watch,
} from "vue";
import { GridStack } from "gridstack";
import { buildPropertySchema as buildIconValuePropertySchema } from "../metrics/IconValueWidget.vue";
import { buildPropertySchema as buildValuePropertySchema } from "../metrics/ValueWidget.vue";
import { buildPropertySchema as buildPieChartPropertySchema } from "../metrics/PieChartWidget.vue";
import { buildPropertySchema as buildBarChartPropertySchema } from "../metrics/BarChartWidget.vue";
import { buildPropertySchema as buildRadarChartPropertySchema } from "../metrics/RadarChartWidget.vue";
import { buildPropertySchema as buildDoughnutChartPropertySchema } from "../metrics/DoughnutChartWidget.vue";
import { buildPropertySchema as buildHeatmapChartPropertySchema } from "../metrics/HeatmapChartWidget.vue";
import { buildPropertySchema as buildLineChartPropertySchema } from "../metrics/LineChartWidget.vue";
import { buildPropertySchema as buildPolarAreaChartPropertySchema } from "../metrics/PolarAreaChartWidget.vue";
import { buildPropertySchema as buildScatterChartPropertySchema } from "../metrics/ScatterChartWidget.vue";
import { buildPropertySchema as buildAudioPlayerPropertySchema } from "../media/AudioPlayerWidget.vue";
import { buildPropertySchema as buildVideoPlayerPropertySchema } from "../media/VideoPlayerWidget.vue";

/** Builds property schema for a widget by type (used after property change). */
function buildPropertySchemaForWidget(widget) {
  if (!widget) return null;
  if (widget.type === "IconValueWidget")
    return buildIconValuePropertySchema(widget);
  if (widget.type === "ValueWidget") return buildValuePropertySchema(widget);
  if (widget.type === "PieChartWidget")
    return buildPieChartPropertySchema(widget);
  if (widget.type === "BarChartWidget")
    return buildBarChartPropertySchema(widget);
  if (widget.type === "RadarChartWidget")
    return buildRadarChartPropertySchema(widget);
  if (widget.type === "DoughnutChartWidget")
    return buildDoughnutChartPropertySchema(widget);
  if (widget.type === "HeatmapChartWidget")
    return buildHeatmapChartPropertySchema(widget);
  if (widget.type === "LineChartWidget")
    return buildLineChartPropertySchema(widget);
  if (widget.type === "PolarAreaChartWidget")
    return buildPolarAreaChartPropertySchema(widget);
  if (widget.type === "ScatterChartWidget")
    return buildScatterChartPropertySchema(widget);
  if (widget.type === "AudioPlayerWidget")
    return buildAudioPlayerPropertySchema(widget);
  if (widget.type === "VideoPlayerWidget")
    return buildVideoPlayerPropertySchema(widget);
  return null;
}

const props = defineProps({
  widgets: { type: Array, default: () => [] },
  /** Optional; overrides inject. Receives (propertySchema, opts?) where opts.update = (key, value) => void */
  openPropertyEditor: { type: Function, default: null },
  identifier: { type: String, default: "" },
  /** Optional: (index, key, value) => void – called when a child widget prop is updated */
  updateWidget: { type: Function, default: null },
  /** Optional: (key, value) => void – called when grid-level props change (e.g. root dashboard) */
  updateGridOptions: { type: Function, default: null },
  gridOptions: { type: Object, default: () => ({}) },
  widgetComponents: { type: Object, default: () => ALLOWED_CHILD_TYPES },
  gridDefaultsByType: {
    type: Object,
    default: () => DEFAULT_GRID_DEFAULTS_BY_TYPE,
  },
  sizeMode: {
    type: String,
    default: "Computed",
    validator: (v) => ["Auto", "Computed"].includes(v),
  },
  backgroundColor: { type: String, default: "" },
  foregroundColor: { type: String, default: "" },
  /** Edit mode: shows grid overlay when true. */
  editMode: { type: Boolean, default: false },
});

const emit = defineEmits(["update:widgets"]);

const gridEl = ref(null);
let grid = null;
let overlayEl = null;
let onDragStop = null;
let onResizeStop = null;
let overlayWrapper = null;
let overlayHighlightEl = null;
let overlayAddButtonEl = null;
let hoveredEmptyCell = { col: -1, row: -1 };
let resizeObserver = null;
let mutationObserver = null;
const isMounted = ref(false);
const LAYOUT_KEYS = ["type", "x", "y", "w", "h", "minW", "minH"];

/** Only allowed child types from widgetComponents; any other type is not rendered as a grid item. */
const contentWidgetComponents = computed(() => {
  const allowed = Object.keys(ALLOWED_CHILD_TYPES);
  return Object.fromEntries(
    Object.entries(props.widgetComponents || {}).filter(([key]) =>
      allowed.includes(key),
    ),
  );
});

const gridWidthPx = computed(() => {
  const col = props.gridOptions.column ?? 12;
  const cellW = getCellWidthPx(props.gridOptions);
  return col * cellW;
});

function parseCellSize(val) {
  if (val == null) return null;
  if (typeof val === "number") return val;
  const match = String(val).match(/^([\d.]+)\s*px$/i);
  return match ? Number(match[1]) : null;
}

/** Get cell height in px; supports cellHeightPx (number) or legacy cellHeight ("75px"). */
function getCellHeightPx(opts) {
  // Prefer the effective GridStack option (`cellHeight`) over our config helper (`cellHeightPx`).
  // GridStack updates `opts.cellHeight` during runtime, while `cellHeightPx` may remain stale.
  const effective = parseCellSize(opts?.cellHeight);
  if (effective != null) return effective;
  if (opts?.cellHeightPx != null) return Number(opts.cellHeightPx);
  return 80;
}

/** Get cell width in px; supports cellWidthPx (number) or legacy cellWidth ("140px"). */
function getCellWidthPx(opts) {
  // Prefer the effective GridStack option (`cellWidth`) over our config helper (`cellWidthPx`).
  const effective = parseCellSize(opts?.cellWidth);
  if (effective != null) return effective;
  if (opts?.cellWidthPx != null) return Number(opts.cellWidthPx);
  return 120;
}

const gridContainerStyle = computed(() => {
  const rowCount = props.gridOptions.row;
  const cellH = getCellHeightPx(props.gridOptions);
  const margin =
    typeof props.gridOptions.margin === "number" ? props.gridOptions.margin : 5;
  const base = { overflow: "hidden" };
  if (rowCount != null && rowCount > 0) {
    base.height = `${rowCount * cellH + (rowCount - 1) * margin}px`;
  } else {
    base.height = "100vh";
  }
  if (props.sizeMode === "Auto") base.width = "100%";
  else base.width = gridWidthPx.value + "px";
  if (props.backgroundColor) base.backgroundColor = props.backgroundColor;
  if (props.foregroundColor) base.color = props.foregroundColor;
  const fg =
    props.foregroundColor?.trim() ||
    props.gridOptions?.foregroundColor?.trim() ||
    "";
  let gridlineColor = "rgba(0, 0, 0, 0.15)";
  if (fg.startsWith("#") && fg.length >= 4) {
    const hex = fg.slice(1);
    const r =
      hex.length === 6
        ? parseInt(hex.substr(0, 2), 16)
        : parseInt(hex[0] + hex[0], 16);
    const g =
      hex.length === 6
        ? parseInt(hex.substr(2, 2), 16)
        : parseInt(hex[1] + hex[1], 16);
    const b =
      hex.length === 6
        ? parseInt(hex.substr(4, 2), 16)
        : parseInt(hex[2] + hex[2], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b))
      gridlineColor = `rgba(${r}, ${g}, ${b}, 0.15)`;
  } else if (fg.startsWith("rgb")) {
    const m = fg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) gridlineColor = `rgba(${m[1]}, ${m[2]}, ${m[3]}, 0.15)`;
  }
  base["--gridline-color"] = gridlineColor;
  return base;
});

const selfAlignmentStyle = computed(() => ({
  alignSelf: "flex-start",
  marginLeft: "Auto",
  marginRight: "Auto",
  width: "100%",
  minWidth: 0,
}));

const contentAlignmentWrapperStyle = computed(() => ({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  width: "100%",
  height: "100%",
  minHeight: "100%",
}));

function getLayout(w) {
  const defaults = props.gridDefaultsByType[w.type] ?? {
    w: 1,
    h: 1,
    minW: 1,
    minH: 1,
  };
  return {
    ...defaults,
    x: w.x,
    y: w.y,
    ...(w.w != null && { w: w.w }),
    ...(w.h != null && { h: w.h }),
    ...(w.minW != null && { minW: w.minW }),
    ...(w.minH != null && { minH: w.minH }),
  };
}

function getLayoutBindings(w) {
  const L = getLayout(w);
  return {
    ...(w?.id != null && { "gs-id": w.id }),
    "gs-x": L.x,
    "gs-y": L.y,
    "gs-w": L.w,
    "gs-h": L.h,
    "gs-min-w": L.minW,
    "gs-min-h": L.minH,
  };
}

// PropertyGridWidget must be provided by parent view - use computed pattern like IconValueWidget
const injectedOpenPropertyEditor = inject("openPropertyEditor", null);
const openPropertyEditor = computed(
  () => props.openPropertyEditor ?? injectedOpenPropertyEditor,
);
const injectedOpenWidgetsSelector = inject("openWidgetsSelector", null);

/** Widgets grouped by meta.group for the widget selector (only allowed child types). */
const widgetsByGroup = computed(() => {
  const allowed = Object.keys(props.widgetComponents || ALLOWED_CHILD_TYPES);
  const map = new Map();
  for (const w of WIDGET_REGISTRY) {
    if (!allowed.includes(w.type)) continue;
    const group = w.group || "Other";
    if (!map.has(group)) map.set(group, []);
    map.get(group).push(w);
  }
  return Array.from(map.entries()).map(([groupName, widgets]) => ({
    groupName,
    widgets,
  }));
});

/** Force GridStack visual layout to match our widgets data. Fixes visual glitches after add/remove. */
function forceGridLayoutSync() {
  if (!grid || !gridEl.value || typeof grid.update !== "function") return;
  const items = gridEl.value.querySelectorAll(".grid-stack-item");
  const widgets = props.widgets || [];
  if (items.length !== widgets.length) return;
  for (let i = 0; i < items.length; i++) {
    const layout = getLayout(widgets[i]);
    grid.update(items[i], { x: layout.x, y: layout.y, w: layout.w, h: layout.h });
  }
}

function adoptNewWidgetInGrid() {
  if (!grid || !gridEl.value) return;
  const items = gridEl.value.querySelectorAll(".grid-stack-item");
  const last = items[items.length - 1];
  if (last && !last.gridstackNode) {
    const widgets = props.widgets || [];
    const lastWidget = widgets[widgets.length - 1];
    const layout = lastWidget ? getLayout(lastWidget) : {};
    grid.makeWidget(last, { ...layout, autoPosition: false });
    updateWidgetTooltips();
    nextTick(forceGridLayoutSync);
  }
}

// When widgets array grows (e.g. parent synced), adopt any new DOM nodes
watch(
  () => (props.widgets || []).length,
  (len, prevLen) => {
    if (isMounted.value && grid) {
      if (len > (prevLen ?? len)) {
        nextTick(adoptNewWidgetInGrid);
      } else if (len < (prevLen ?? len)) {
        nextTick(forceGridLayoutSync);
      }
    }
  },
);

function removeWidgetAt(index) {
  const next = [...(props.widgets || [])];
  next.splice(index, 1);
  emit("update:widgets", next);
}

function getWidgetProps(w, index) {
  const base = Object.fromEntries(
    Object.entries(w).filter(([key]) => !LAYOUT_KEYS.includes(key)),
  );
  base.editMode = props.editMode;
  base.removeWidget = () => removeWidgetAt(index);
  // Use computed openPropertyEditor (props or inject)
  const fn = openPropertyEditor.value;
  if (fn) {
    const doUpdate = (key, value) => {
      if (key === "uniqueName" && w?.type === "IconValueWidget") {
        const newName = String(value || "").trim();
        if (newName) {
          const existing = collectIconValueUniqueNames(props.widgets || []);
          existing.delete(String(w.uniqueName || "").trim());
          if (existing.has(newName)) {
            alert(
              "Another Icon & Value widget already has this name. Please choose a unique name.",
            );
            return;
          }
        }
      }
      if (props.updateWidget) {
        props.updateWidget(index, key, value);
      } else {
        const next = [...(props.widgets || [])];
        next[index] = { ...next[index], [key]: value };
        emit("update:widgets", next);
      }
    };
    if (props.updateWidget) {
      base.openPropertyEditor = (propertySchema) =>
        fn(propertySchema, {
          update: doUpdate,
          widgetIndex: index,
          refresh: () => buildPropertySchemaForWidget(props.widgets[index]),
        });
    } else {
      base.openPropertyEditor = (propertySchema) =>
        fn(propertySchema, {
          update: doUpdate,
          widgetIndex: index,
          refresh: () => buildPropertySchemaForWidget(props.widgets[index]),
        });
    }
  }
  return base;
}

/** Get the widget description for tooltip. Only shows the description field. */
function getWidgetDescription(widget) {
  if (!widget) return "";
  const d = widget.description;
  return d != null && String(d).trim() ? String(d).trim() : "";
}

function updateWidgetTooltips() {
  nextTick(() => {
    if (!gridEl.value || !grid) return;
    const widgets = props.widgets || [];
    const widgetById = new Map(
      widgets.filter((w) => w?.id).map((w) => [w.id, w]),
    );
    gridEl.value.querySelectorAll(".grid-stack-item").forEach((el) => {
      const id = el.getAttribute("gs-id") ?? el.gridstackNode?.id;
      const widget = id ? widgetById.get(id) : null;
      const desc = getWidgetDescription(widget);
      el.setAttribute("title", desc || "");
    });
  });
}

function updateOverlaySize() {
  if (!overlayEl || !grid) return;
  // Use configured values as the source of truth. GridStack can temporarily
  // change internal values (and node ordering) during resize/drag/column changes.
  const cols =
    grid.getColumn?.() ?? props.gridOptions?.column ?? grid.opts?.column ?? 12;
  const cellH = getCellHeightPx(props.gridOptions ?? grid.opts);
  const margin =
    typeof props.gridOptions?.margin === "number"
      ? props.gridOptions.margin
      : typeof grid.opts?.margin === "number"
        ? grid.opts.margin
        : 5;
  const rowCount = props.gridOptions?.row ?? grid.opts?.row;

  overlayEl.style.backgroundSize = `calc(100% / ${cols}) ${cellH}px`;

  // Set wrapper height to clip overlay at configured row count
  // This prevents overlay from showing extra rows when the drag-and-drop grid expands the container
  if (overlayWrapper) {
    if (rowCount != null && rowCount > 0) {
      const maxHeight = rowCount * cellH + (rowCount - 1) * margin;
      overlayWrapper.style.height = `${maxHeight}px`;
      // Add bottom border to show last row's bottom edge
      updateOverlayGridlineColor();
    } else {
      overlayWrapper.style.height = "100%";
      updateOverlayGridlineColor();
    }
  }
}

function handleOverlayHover(e) {
  if (
    !overlayHighlightEl ||
    !overlayWrapper ||
    !grid ||
    !props.editMode ||
    gridEl.value?.classList.contains("dragging")
  )
    return;
  const rect = overlayWrapper.getBoundingClientRect();
  const localX = e.clientX - rect.left;
  const localY = e.clientY - rect.top;
  if (
    localX < 0 ||
    localY < 0 ||
    localX >= rect.width ||
    localY >= rect.height
  ) {
    overlayHighlightEl.style.display = "none";
    hoveredEmptyCell = { col: -1, row: -1 };
    if (overlayAddButtonEl) overlayAddButtonEl.style.display = "none";
    return;
  }
  const cols =
    grid.getColumn?.() ?? props.gridOptions?.column ?? grid.opts?.column ?? 12;
  const cellH = getCellHeightPx(props.gridOptions ?? grid.opts);
  const cellW = rect.width / cols;
  const col = Math.min(cols - 1, Math.floor(localX / cellW));
  const row = Math.floor(localY / cellH);
  const rowCount = props.gridOptions?.row ?? grid.opts?.row;
  if (rowCount != null && row >= rowCount) {
    overlayHighlightEl.style.display = "none";
    hoveredEmptyCell = { col: -1, row: -1 };
    if (overlayAddButtonEl) overlayAddButtonEl.style.display = "none";
    return;
  }
  if (isCellOccupied(col, row)) {
    overlayHighlightEl.style.display = "none";
    hoveredEmptyCell = { col: -1, row: -1 };
    if (overlayAddButtonEl) overlayAddButtonEl.style.display = "none";
    return;
  }
  overlayHighlightEl.style.left = `${col * cellW}px`;
  overlayHighlightEl.style.top = `${row * cellH}px`;
  overlayHighlightEl.style.width = `${cellW}px`;
  overlayHighlightEl.style.height = `${cellH}px`;
  overlayHighlightEl.style.display = "block";

  hoveredEmptyCell = { col, row };
  if (overlayAddButtonEl) {
    overlayAddButtonEl.style.left = `${col * cellW}px`;
    overlayAddButtonEl.style.top = `${row * cellH}px`;
    overlayAddButtonEl.style.width = `${cellW}px`;
    overlayAddButtonEl.style.height = `${cellH}px`;
    overlayAddButtonEl.style.display = "flex";
  }
}

function handleOverlayLeave() {
  if (overlayHighlightEl) overlayHighlightEl.style.display = "none";
  hoveredEmptyCell = { col: -1, row: -1 };
  if (overlayAddButtonEl) overlayAddButtonEl.style.display = "none";
}

function handleAddButtonClick() {
  const openSelector = injectedOpenWidgetsSelector;
  const { col, row } = hoveredEmptyCell;
  if (col < 0 || row < 0 || !openSelector || !widgetsByGroup.value.length)
    return;
  openSelector(widgetsByGroup.value, { col, row }, (widgetType) =>
    addWidgetAtCell(widgetType, col, row),
  );
}

function updateOverlayGridlineColor() {
  if (!overlayEl) return;
  try {
    // Use CSS variable --gridline-color from parent (grid-stack) - set in gridContainerStyle
    // Vue reactivity on gridContainerStyle ensures it updates when foregroundColor changes
    const bgImage =
      "linear-gradient(to right, var(--gridline-color) 1px, transparent 1px), linear-gradient(to bottom, var(--gridline-color) 1px, transparent 1px)";
    overlayEl.style.setProperty("background-image", bgImage, "important");
    if (overlayWrapper) {
      overlayWrapper.style.borderBottom = "1px solid var(--gridline-color)";
    }
  } catch (error) {
    console.warn(
      "GridLayoutWidget: Error in updateOverlayGridlineColor:",
      error,
    );
  }
}

function updateEmptyState() {
  if (!gridEl.value || !grid) return;
  const isEmpty = (grid.engine?.nodes?.length ?? 0) === 0;
  gridEl.value.classList.toggle("empty-grid", isEmpty);
}

function syncGridToWidgets() {
  if (!props.editMode) return;
  if (!grid?.engine?.nodes || !props.widgets?.length) return;
  const nodes = grid.engine.nodes;
  const current = props.widgets || [];

  const nodeById = new Map();
  for (const node of nodes) {
    const id = node?.id ?? node?.el?.getAttribute?.("gs-id");
    if (id != null) nodeById.set(String(id), node);
  }

  let changed = false;
  const next = current.map((w) => {
    const id = w?.id != null ? String(w.id) : null;
    const node = id ? nodeById.get(id) : null;
    if (!node) return w;

    const nx = node.x ?? 0;
    const ny = node.y ?? 0;
    const nw = node.w ?? 1;
    const nh = node.h ?? 1;

    if (w.x !== nx || w.y !== ny || w.w !== nw || w.h !== nh) changed = true;
    return { ...w, x: nx, y: ny, w: nw, h: nh };
  });

  if (changed) emit("update:widgets", next);
}

/** Sync only positions (x, y) from grid; keep w, h from current widgets. Use after column/options change so we don't persist any size changes GridStack may have applied. */
function syncGridToWidgetsPositionsOnly() {
  if (!props.editMode) return;
  if (!grid?.engine?.nodes || !props.widgets?.length) return;
  const nodes = grid.engine.nodes;
  const current = props.widgets || [];

  const nodeById = new Map();
  for (const node of nodes) {
    const id = node?.id ?? node?.el?.getAttribute?.("gs-id");
    if (id != null) nodeById.set(String(id), node);
  }

  let changed = false;
  const next = current.map((w) => {
    const id = w?.id != null ? String(w.id) : null;
    const node = id ? nodeById.get(id) : null;
    if (!node) return w;

    const nx = node.x ?? 0;
    const ny = node.y ?? 0;

    if (w.x !== nx || w.y !== ny) changed = true;
    return { ...w, x: nx, y: ny };
  });

  if (changed) emit("update:widgets", next);
}

/** Restore each grid node's w/h from props.widgets so display matches our data after column change (GridStack may have altered sizes). */
function restoreNodeSizesFromWidgets() {
  if (
    !grid?.engine?.nodes ||
    !props.widgets?.length ||
    !gridEl.value ||
    typeof grid.update !== "function"
  )
    return;
  const nodes = grid.engine.nodes;
  const current = props.widgets || [];
  const widgetById = new Map(
    current
      .filter((w) => w?.id != null)
      .map((w) => [String(w.id), w]),
  );
  for (const node of nodes) {
    const id = node?.id ?? node?.el?.getAttribute?.("gs-id");
    if (id == null) continue;
    const w = widgetById.get(String(id));
    if (!w) continue;
    const nw = w.w ?? 1;
    const nh = w.h ?? 1;
    if (node.w !== nw || node.h !== nh) {
      const el =
        node.el ??
        gridEl.value.querySelector(
          `.grid-stack-item[gs-id="${CSS?.escape ? CSS.escape(String(id)) : String(id)}"]`,
        );
      if (el) grid.update(el, { w: nw, h: nh });
    }
  }
}

/** Re-apply exact layout (x,y,w,h) by widget id (gs-id). This avoids index-order issues. */
function applyLayoutById(layout) {
  if (!gridEl.value || !grid || typeof grid.update !== "function") return;
  if (!Array.isArray(layout) || !layout.length) return;
  for (const item of layout) {
    if (!item?.id) continue;
    const el = gridEl.value.querySelector(
      `.grid-stack-item[gs-id="${CSS?.escape ? CSS.escape(String(item.id)) : String(item.id)}"]`,
    );
    if (!el) continue;
    grid.update(el, {
      x: item.x ?? 0,
      y: item.y ?? 0,
      w: item.w ?? 1,
      h: item.h ?? 1,
    });
  }
}

function handleGridChange() {
  updateEmptyState();
  updateOverlaySize();
}

onMounted(() => {
  if (!gridEl.value) return;
  const opts = {
    column: props.gridOptions?.column ?? 12,
    row: props.gridOptions?.row ?? 12,
    maxRow: props.gridOptions?.row ?? 12,
    margin: 5,
    acceptWidgets: true,
    alwaysShowResizeHandle: props.editMode,
    disableResize: !props.editMode,
    disableDrag: !props.editMode,
    float: true,
    disableOneColumnMode: true,
    draggable: {
      scroll: true,
      scrollSensitivity: 100,
      scrollSpeed: 10,
      preventOutline: true,
      preventOutlineOnDrag: true,
      preventOutlineOnDrop: true,
      preventOutlineOnScroll: true,
    },
    ...props.gridOptions,
  };
  opts.cellHeight = getCellHeightPx(opts);
  opts.cellWidth = getCellWidthPx(opts);
  if (props.gridOptions?.row != null) opts.maxRow = opts.row;
  grid = GridStack.init(opts, gridEl.value);
  grid.updateOptions({
    acceptWidgets: (el) => el.gridstackNode?.grid === grid,
  });
  if (typeof grid.setStatic === "function") {
    grid.setStatic(!props.editMode);
  }
  updateWidgetTooltips();
  grid.on("resizestop dragstop", updateWidgetTooltips);

  // Create overlay wrapper and overlay element
  if (!gridEl.value.querySelector(".grid-overlay-wrapper")) {
    overlayWrapper = document.createElement("div");
    overlayWrapper.className = "grid-overlay-wrapper";
    overlayWrapper.setAttribute("aria-hidden", "true");

    overlayEl = document.createElement("div");
    overlayEl.className = "grid-overlay";
    overlayEl.setAttribute("aria-hidden", "true");

    overlayHighlightEl = document.createElement("div");
    overlayHighlightEl.className = "grid-overlay-cell-highlight";
    overlayHighlightEl.setAttribute("aria-hidden", "true");

    overlayWrapper.appendChild(overlayEl);
    overlayWrapper.appendChild(overlayHighlightEl);
    gridEl.value.prepend(overlayWrapper);
  } else {
    overlayWrapper = gridEl.value.querySelector(".grid-overlay-wrapper");
    overlayEl = overlayWrapper.querySelector(".grid-overlay");
    overlayHighlightEl = overlayWrapper.querySelector(
      ".grid-overlay-cell-highlight",
    );
    if (!overlayHighlightEl) {
      overlayHighlightEl = document.createElement("div");
      overlayHighlightEl.className = "grid-overlay-cell-highlight";
      overlayHighlightEl.setAttribute("aria-hidden", "true");
      overlayWrapper.appendChild(overlayHighlightEl);
    }
  }

  overlayAddButtonEl = gridEl.value.querySelector(".grid-overlay-add-button");
  if (!overlayAddButtonEl) {
    overlayAddButtonEl = document.createElement("button");
    overlayAddButtonEl.className = "grid-overlay-add-button";
    overlayAddButtonEl.setAttribute("type", "button");
    overlayAddButtonEl.setAttribute("aria-label", "Add widget");
    overlayAddButtonEl.innerHTML = '<i class="fa-solid fa-circle-plus"></i>';
    overlayAddButtonEl.addEventListener("click", handleAddButtonClick);
    gridEl.value.appendChild(overlayAddButtonEl);
  }

  gridEl.value.addEventListener("mousemove", handleOverlayHover);
  gridEl.value.addEventListener("mouseleave", handleOverlayLeave);

  // Update overlay gridline color based on foregroundColor
  updateOverlayGridlineColor();

  // Set initial edit-mode class
  if (props.editMode) {
    gridEl.value.classList.add("edit-mode");
  }

  // Wire grid library (GridStack) events
  grid.on("added removed change", handleGridChange);
  grid.on("dragstart", () => {
    gridEl.value?.classList.add("dragging");
    updateOverlaySize(); // Re-clamp overlay when dragging starts
  });
  onDragStop = () => {
    gridEl.value?.classList.remove("dragging");
    updateOverlaySize();
    nextTick(syncGridToWidgets);
  };
  onResizeStop = () => {
    updateOverlaySize();
    nextTick(syncGridToWidgets);
  };
  grid.on("dragstop", onDragStop);
  grid.on("resizestop", onResizeStop);

  // Initial updates
  updateOverlaySize();
  updateEmptyState();

  // Mark as mounted
  isMounted.value = true;

  // Watch for container resize (important for auto-width mode)
  if (props.sizeMode === "Auto" && ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (props.editMode) {
        updateOverlaySize(); // Ensure overlay height stays clamped
      }
    });
    resizeObserver.observe(gridEl.value);
  }

  // Watch for container height changes to clamp overlay (prevents extra row from showing)
  if (MutationObserver && gridEl.value) {
    mutationObserver = new MutationObserver(() => {
      if (props.editMode && overlayWrapper) {
        nextTick(() => {
          updateOverlaySize(); // Re-clamp overlay height after DOM updates
        });
      }
    });
    mutationObserver.observe(gridEl.value, {
      attributes: true,
      attributeFilter: ["style"],
      childList: false,
      subtree: false,
    });
  }
});

onBeforeUnmount(() => {
  isMounted.value = false;
  if (grid) {
    grid.off("added removed change", handleGridChange);
    grid.off("dragstart");
    if (onDragStop) grid.off("dragstop", onDragStop);
    if (onResizeStop) grid.off("resizestop", onResizeStop);
    grid.off("resizestop dragstop", updateWidgetTooltips);
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  if (gridEl.value) {
    gridEl.value.removeEventListener("mousemove", handleOverlayHover);
    gridEl.value.removeEventListener("mouseleave", handleOverlayLeave);
  }
  if (overlayAddButtonEl) {
    overlayAddButtonEl.removeEventListener("click", handleAddButtonClick);
    overlayAddButtonEl.parentNode?.removeChild(overlayAddButtonEl);
    overlayAddButtonEl = null;
  }
  if (overlayWrapper && overlayWrapper.parentNode) {
    overlayWrapper.parentNode.removeChild(overlayWrapper);
    overlayWrapper = null;
    overlayEl = null;
    overlayHighlightEl = null;
  }
});

// Widget container click: open PropertyGridWidget for GridLayoutWidget itself (like IconValueWidget pattern)
// Merge gridOptions into a props-like object so schema shows current row/column/cellHeight/cellWidth
function buildPropertySchemaFromProps() {
  const merged = {
    ...props,
    rows: props.gridOptions?.row ?? props.rows ?? 12,
    columns: props.gridOptions?.column ?? props.columns ?? 12,
    cellHeightPx: props.gridOptions?.cellHeightPx ?? props.cellHeightPx ?? 70,
    cellWidthPx: props.gridOptions?.cellWidthPx ?? props.cellWidthPx ?? 120,
    sizeMode: props.gridOptions?.sizeMode ?? props.sizeMode ?? "Computed",
  };
  return buildPropertySchema(merged);
}

/** Check if cell (col, row) is occupied. Uses props.widgets as source of truth so empty cells (e.g. after widget removal) are correctly detected. */
function isCellOccupied(col, row) {
  return getWidgetAtCell(col, row) != null;
}

/** Get the widget and its index that occupies cell (col, row). Returns { widget, index } or null. */
function getWidgetAtCell(col, row) {
  const list = props.widgets ?? [];
  for (let i = 0; i < list.length; i++) {
    const w = list[i];
    const x = w.x ?? 0;
    const y = w.y ?? 0;
    const ww = w.w ?? 1;
    const hh = w.h ?? 1;
    if (col >= x && col < x + ww && row >= y && row < y + hh) {
      return { widget: w, index: i };
    }
  }
  return null;
}

/** Default props for a newly added widget (e.g. uniqueName for IconValueWidget). */
function getDefaultWidgetProps(widgetType) {
  if (widgetType === "IconValueWidget") {
    const existing = collectIconValueUniqueNames(props.widgets || []);
    return { uniqueName: generateUniqueIconValueName(existing) };
  }
  const chartDefaults = (name, title, extra = {}) => ({
    uniqueName: generateWidgetIdentifier(name),
    description: "",
    title,
    ...extra,
  });
  if (widgetType === "DoughnutChartWidget")
    return chartDefaults("DoughnutChartWidget", "Doughnut Chart", {
      labels: "A,B,C",
      values: "40,30,30",
      colors: "#0d6efd,#6c757d,#198754",
    });
  if (widgetType === "HeatmapChartWidget")
    return chartDefaults("HeatmapChartWidget", "Heatmap Chart", {
      values: "2024-01-15:5;2024-01-16:3;2024-01-20:10;2024-02-01:2",
      endDate: "",
    });
  if (widgetType === "LineChartWidget")
    return chartDefaults("LineChartWidget", "Line Chart", {
      labels: "Jan,Feb,Mar",
      values: "10,20,30",
    });
  if (widgetType === "PieChartWidget")
    return chartDefaults("PieChartWidget", "Pie Chart", {
      labels: "Open,In Progress,Closed",
      values: "12,7,21",
      colors: "#4e79a7,#f28e2b,#59a14f",
    });
  if (widgetType === "BarChartWidget")
    return chartDefaults("BarChartWidget", "Bar Chart", {
      labels: "Jan,Feb,Mar",
      values: "10,20,30",
      barColor: "#0d6efd",
    });
  if (widgetType === "PolarAreaChartWidget")
    return chartDefaults("PolarAreaChartWidget", "Polar Area Chart", {
      labels: "A,B,C",
      values: "11,16,7",
      colors: "#0d6efd,#6c757d,#198754",
    });
  if (widgetType === "RadarChartWidget")
    return chartDefaults("RadarChartWidget", "Radar Chart", {
      labels: "Speed,Power,Skill,Stamina,Agility",
      values: "65,59,90,81,56",
    });
  if (widgetType === "ScatterChartWidget")
    return chartDefaults("ScatterChartWidget", "Scatter Chart", {
      points: "0,10;1,20;2,15",
    });
  if (widgetType === "AudioPlayerWidget")
    return chartDefaults("AudioPlayerWidget", "Audio Player", {
      mediaUrl: "",
      trackTitle: "Summer Vibes",
      trackArtist: "John Smith",
      albumArtUrl:
        "https://images.unsplash.com/photo-1564419431636-fe02f0eff7aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    });
  if (widgetType === "VideoPlayerWidget")
    return chartDefaults("VideoPlayerWidget", "Video Player", {
      videoUrl: "",
      videoTitle: "Video Title",
      videoDescription: "Description",
      posterUrl:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    });
  return {};
}

function addWidgetAtCell(widgetType, x, y) {
  const defaults = props.gridDefaultsByType?.[widgetType] ?? {
    w: 1,
    h: 1,
    minW: 1,
    minH: 1,
  };
  const defaultProps = getDefaultWidgetProps(widgetType);
  const newWidget = {
    type: widgetType,
    x,
    y,
    w: defaults.w ?? 1,
    h: defaults.h ?? 1,
    minW: defaults.minW ?? 1,
    minH: defaults.minH ?? 1,
    ...defaultProps,
  };
  const next = [...(props.widgets || []), newWidget];
  emit("update:widgets", next);
}

function onWidgetClick() {
  const fn = openPropertyEditor.value;
  if (!fn) return;
  const updateGrid = props.updateGridOptions ?? props.updateWidget;
  fn(buildPropertySchemaFromProps(), updateGrid ? { update: updateGrid } : {});
}

/** Open the property grid for a specific widget (by index). */
function openWidgetPropertyEditor(widget, index) {
  const fn = openPropertyEditor.value;
  if (!fn) return;
  const schema = buildPropertySchemaForWidget(widget);
  if (!schema) return;
  const doUpdate = (key, value) => {
    if (key === "uniqueName" && widget?.type === "IconValueWidget") {
      const newName = String(value || "").trim();
      if (newName) {
        const existing = collectIconValueUniqueNames(props.widgets || []);
        existing.delete(String(widget.uniqueName || "").trim());
        if (existing.has(newName)) {
          alert(
            "Another Icon & Value widget already has this name. Please choose a unique name.",
          );
          return;
        }
      }
    }
    if (props.updateWidget) {
      props.updateWidget(index, key, value);
    } else {
      const next = [...(props.widgets || [])];
      next[index] = { ...next[index], [key]: value };
      emit("update:widgets", next);
    }
  };
  fn(schema, {
    update: doUpdate,
    widgetIndex: index,
    refresh: () => buildPropertySchemaForWidget(props.widgets[index]),
  });
}

function handleGridDoubleClick(e) {
  if (!props.editMode) return;
  const onWidgetEl = e.target.closest(".grid-stack-item");
  if (onWidgetEl) {
    const id = onWidgetEl.getAttribute("gs-id") ?? onWidgetEl.gridstackNode?.id;
    const index = id
      ? (props.widgets || []).findIndex((w) => String(w?.id) === String(id))
      : -1;
    if (index >= 0) {
      openWidgetPropertyEditor(props.widgets[index], index);
    } else {
      onWidgetClick();
    }
    return;
  }
  const openSelector = injectedOpenWidgetsSelector;
  if (!gridEl.value || !overlayWrapper) return;
  const rect = overlayWrapper.getBoundingClientRect();
  const localX = e.clientX - rect.left;
  const localY = e.clientY - rect.top;
  if (localX < 0 || localY < 0 || localX >= rect.width || localY >= rect.height)
    return;
  const cols = grid?.getColumn?.() ?? grid?.opts?.column ?? 12;
  const cellH = getCellHeightPx(grid?.opts);
  const cellW = rect.width / cols;
  const col = Math.min(cols - 1, Math.max(0, Math.floor(localX / cellW)));
  const row = Math.floor(localY / cellH);
  const rowCount = grid?.opts?.row;
  if (rowCount != null && row >= rowCount) return;
  const atCell = getWidgetAtCell(col, row);
  if (atCell) {
    openWidgetPropertyEditor(atCell.widget, atCell.index);
    return;
  }
  if (openSelector && widgetsByGroup.value.length) {
    openSelector(widgetsByGroup.value, { col, row }, (widgetType) =>
      addWidgetAtCell(widgetType, col, row),
    );
  } else {
    onWidgetClick();
  }
}

// Watch widgets to refresh tooltips when description/label/etc. changes
watch(
  () => props.widgets,
  () => {
    if (isMounted.value && grid) updateWidgetTooltips();
  },
  { deep: true },
);

// Watch editMode to toggle class and resize handle visibility
watch(
  () => props.editMode,
  (val) => {
    if (gridEl.value) gridEl.value.classList.toggle("edit-mode", val);
    if (grid && typeof grid.updateOptions === "function") {
      grid.updateOptions({
        alwaysShowResizeHandle: val,
        disableResize: !val,
        disableDrag: !val,
      });
    }
    if (grid && typeof grid.setStatic === "function") {
      grid.setStatic(!val);
    }
  },
  { immediate: true },
);

// Watch gridOptions and sizeMode changes to update overlay size and grid configuration
watch(
  () => [
    props.gridOptions?.column,
    props.gridOptions?.row,
    props.gridOptions?.cellHeightPx,
    props.gridOptions?.cellWidthPx,
    props.gridOptions?.margin,
    props.gridOptions?.sizeMode ?? props.sizeMode,
  ],
  ([cols, rows, cellHeightPx, cellWidthPx, margin, sizeMode]) => {
    if (!isMounted.value || !grid || !overlayEl) return;

    try {
      const saved = (props.widgets || []).map((w) => ({
        id: w?.id,
        x: w?.x ?? 0,
        y: w?.y ?? 0,
        w: w?.w ?? 1,
        h: w?.h ?? 1,
      }));

      const canBatch =
        typeof grid.batchUpdate === "function" &&
        typeof grid.commit === "function";
      if (canBatch) grid.batchUpdate();

      // Update grid column/row configuration. Use 'none' so positions and sizes (x,y,w,h)
      // stay unchanged when changing columns; only adjust if items don't fit.
      if (cols != null && typeof grid.column === "function") {
        grid.column(cols, "none");
      }
      if (rows != null && grid.opts) {
        grid.opts.row = rows;
        grid.opts.maxRow = rows;
        // `row` is a shortcut for `minRow=maxRow=row`. Keep all in sync and update the engine
        // directly because `updateOptions()` doesn't guarantee support for these at runtime.
        grid.opts.minRow = rows;
        if (grid.engine) grid.engine.maxRow = rows;
        if (typeof grid.updateOptions === "function") {
          grid.updateOptions({ row: rows, minRow: rows, maxRow: rows });
        }
        // Force container height recalculation immediately (GridStack uses this during resize/drag).
        if (typeof grid._updateContainerHeight === "function") {
          grid._updateContainerHeight();
        }
      }
      // Update cell dimensions so changes in property panel take effect
      if (cellHeightPx != null || cellWidthPx != null) {
        const opts = {};
        if (cellHeightPx != null) opts.cellHeight = cellHeightPx;
        if (cellWidthPx != null) opts.cellWidth = cellWidthPx;
        if (
          Object.keys(opts).length &&
          typeof grid.updateOptions === "function"
        ) {
          grid.updateOptions(opts);
        }
        if (grid.opts) {
          if (cellHeightPx != null) grid.opts.cellHeight = cellHeightPx;
          if (cellWidthPx != null) grid.opts.cellWidth = cellWidthPx;
        }
      }
      // Keep margin in sync so overlay clamping (and grid) reflects it.
      if (margin != null) {
        if (typeof grid.updateOptions === "function") {
          grid.updateOptions({ margin });
        }
        if (grid.opts) grid.opts.margin = margin;
      }
      nextTick(() => {
        if (grid && overlayEl) {
          // Re-apply the exact saved layout by id so GridStack doesn't normalize "full width" items
          // (e.g. w=2 in 2-col grid becoming w=3 when switching to 3 cols).
          applyLayoutById(saved);
          updateOverlaySize();
          updateOverlayGridlineColor();
          updateWidgetTooltips();
          forceGridLayoutSync();
          if (canBatch && grid && typeof grid.commit === "function") {
            grid.commit();
          }
        }
      });
    } catch (error) {
      console.warn("GridLayoutWidget: Error updating grid options:", error);
    }
  },
  { deep: true },
);

// Gridline color is driven by --gridline-color in gridContainerStyle (Vue reactivity).
// updateOverlayGridlineColor sets background-image to use var(--gridline-color).
</script>

<template>
  <div
    class="dashboard-grid-widget-root"
    :class="{ 'edit-mode': editMode }"
    :style="selfAlignmentStyle"
    tabindex="0"
    @keydown.enter.prevent="onWidgetClick"
  >
    <div
      class="dashboard-grid-widget-content-wrapper"
      :style="contentAlignmentWrapperStyle"
    >
      <div
        ref="gridEl"
        class="grid-stack"
        :class="{ 'edit-mode': editMode }"
        :style="gridContainerStyle"
      >
        <div
          v-for="(w, i) in widgets"
          :key="w.id ?? `w-${i}`"
          class="grid-stack-item"
          v-bind="getLayoutBindings(w)"
        >
          <div class="grid-stack-item-content">
            <component
              v-if="contentWidgetComponents[w.type]"
              :is="contentWidgetComponents[w.type]"
              v-bind="getWidgetProps(w, i)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid-widget-root.edit-mode {
  cursor: pointer;
}
</style>

<style scoped>
.grid-stack {
  position: relative;
}
</style>

<style>
/* Overlay styles must be global because overlay element is created programmatically */
.grid-overlay-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  /* background-image set via JS from foregroundColor */
  opacity: 0;
  transition: opacity 0.18s ease;
}

.grid-stack.edit-mode .grid-overlay-wrapper {
  display: block;
}

.grid-stack.edit-mode .grid-overlay {
  opacity: 1;
}

.grid-stack:not(.edit-mode) .grid-overlay-wrapper {
  display: none;
}

.grid-stack:not(.edit-mode) .grid-overlay {
  opacity: 0;
}

.grid-stack.edit-mode.dragging .grid-overlay-wrapper .grid-overlay {
  opacity: 0.25;
}

.grid-overlay-cell-highlight {
  position: absolute;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  display: none;
}

.grid-overlay-add-button {
  position: absolute;
  pointer-events: auto;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 2;
  margin: 0;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}
.grid-overlay-add-button:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.25);
}
.grid-stack:not(.edit-mode) .grid-overlay-add-button {
  display: none !important;
}

.grid-stack:not(.edit-mode) .ui-resizable-handle {
  display: none !important;
}

/* Resize handle: show only on hover of grid item when in edit mode */
.grid-stack.edit-mode .grid-stack-item .ui-resizable-handle {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.grid-stack.edit-mode .grid-stack-item:hover .ui-resizable-handle {
  opacity: 1;
}
</style>
