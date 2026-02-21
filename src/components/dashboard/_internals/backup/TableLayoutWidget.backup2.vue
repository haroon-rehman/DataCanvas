<script setup>
import { ref, computed, watch, onMounted, inject, provide } from "vue";
import { useRoute } from "vue-router";
import { widgetMeta as iconValueWidgetMeta } from "../metrics/IconValueWidget.vue";
import { widgetMeta as valueWidgetMeta } from "../metrics/ValueWidget.vue";
import { widgetMeta as gridLayoutWidgetMeta } from "./GridLayoutWidget.vue";
import { generateWidgetIdentifier } from "../../_internals/widgetIdentifierCounter.js";
import { useCellWidths } from "../../../../composables/useNestedColumnSizing";

/** Metadata for this widget (selector label, icon, group). */
const widgetMeta = {
  friendlyName: "Table layout",
  description: "Nested table layout (rows and columns).",
  icon: "fa-solid fa-table",
  group: "Layout",
};

// Registry of widgets for the selector: { type, friendlyName, description, icon, group }
const WIDGET_REGISTRY = [
  { type: "IconValueWidget", ...iconValueWidgetMeta },
  { type: "GridLayoutWidget", ...gridLayoutWidgetMeta },
  { type: "TableLayoutWidget", ...widgetMeta },
  { type: "ValueWidget", ...valueWidgetMeta },
];

/** Widgets grouped by meta.group for the accordion (array of { groupName, widgets }). */
const widgetsByGroup = computed(() => {
  const map = new Map();
  for (const w of WIDGET_REGISTRY) {
    const group = w.group || "Other";
    if (!map.has(group)) map.set(group, []);
    map.get(group).push(w);
  }
  return Array.from(map.entries()).map(([groupName, widgets]) => ({
    groupName,
    widgets,
  }));
});

// ============================================================================
// Props & Emits
// ============================================================================

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  /** Map of widget type name -> component (e.g. { IconValueWidget, GridLayoutWidget }) for rendering in preview. */
  widgetComponents: { type: Object, default: () => ({}) },
  /** Map of widget type -> gridDefaults for GridLayoutWidget (e.g. { IconValueWidget: { w:1, h:2 } }). */
  gridDefaultsByType: { type: Object, default: () => ({}) },
  /** Options for GridLayoutWidget (column, cellHeight, etc.). */
  gridOptions: {
    type: Object,
    default: () => ({
      column: 3,
      cellHeight: "70px",
      cellWidth: "120px",
      margin: 5,
    }),
  },
  /** Components allowed inside GridLayoutWidget (e.g. { IconValueWidget }). If omitted, widgetComponents is used. */
  contentWidgetComponents: { type: Object, default: null },
  /** When set (e.g. by parent grid cell), nested percent columns are computed as pixel widths from this width. */
  cellWidthPx: { type: Number, default: 0 },
});

// ---------------------------------------------------------------------------
// Sample JSON: cell with nested columns (percent → px from parent cell width)
// ---------------------------------------------------------------------------
// A cell that enables nested column layout (percent columns resolved as pixels):
//
// {
//   "rows": [
//     {
//       "id": "row-1",
//       "height": { "kind": "auto" },
//       "columns": [
//         {
//           "kind": "percent",
//           "percent": 50,
//           "content": {
//             "type": "TableLayoutWidget",
//             "props": {
//               "rows": [
//                 {
//                   "id": "nested-row-1",
//                   "height": { "kind": "auto" },
//                   "columns": [
//                     { "kind": "percent", "percent": 50 },
//                     { "kind": "percent", "percent": 50 }
//                   ]
//                 }
//               ]
//             }
//           }
//         },
//         { "kind": "percent", "percent": 50 }
//       ]
//     }
//   ]
// }
//
// The outer cell spans 50% of the dashboard; the inner TableLayoutWidget's
// columns (50%, 50%) are computed as pixel widths from that cell's rendered width.

const emit = defineEmits(["update:modelValue"]);

// Refs for grid cells that contain a nested TableLayoutWidget (key: "rowIndex-colIndex").
const cellRefsForNested = ref({});
function setCellRefForNested(rowIndex, colIndex, el) {
  const key = `${rowIndex}-${colIndex}`;
  const current = cellRefsForNested.value[key];
  if (el) {
    if (current === el) return;
    cellRefsForNested.value = { ...cellRefsForNested.value, [key]: el };
  } else {
    if (current === undefined) return;
    const next = { ...cellRefsForNested.value };
    delete next[key];
    cellRefsForNested.value = next;
  }
}
const cellWidthsForNested = useCellWidths(cellRefsForNested);

/** Resolve content widget map for nested GridLayoutWidget (exclude layout widgets if needed). */
const resolvedContentWidgetComponents = computed(() =>
  props.contentWidgetComponents != null
    ? props.contentWidgetComponents
    : props.widgetComponents,
);

/** Update widget property in a cell. */
function updateWidgetProperty(rowIndex, colIndex, key, value) {
  const newRows = localModel.value.rows.map((r, i) => {
    if (i !== rowIndex) return r;
    const newColumns = r.columns.map((c, j) => {
      if (j !== colIndex) return c;
      return {
        ...c,
        content: {
          ...c.content,
          props: {
            ...(c.content?.props ?? {}),
            [key]: value,
          },
        },
      };
    });
    return { ...r, columns: newColumns };
  });
  localModel.value = { ...localModel.value, rows: newRows };
}

/** Clear selectedRegionId in all cells that contain a nested TableLayoutWidget (closes their offcanvases). */
function clearNestedTablesSelection() {
  const newRows = localModel.value.rows.map((row) => {
    const newColumns = (row.columns || []).map((col) => {
      if (col?.content?.type === "TableLayoutWidget" && col?.content?.props) {
        return {
          ...col,
          content: {
            ...col.content,
            props: { ...col.content.props, selectedRegionId: undefined },
          },
        };
      }
      return col;
    });
    return { ...row, columns: newColumns };
  });
  localModel.value = { ...localModel.value, rows: newRows };
}

/** When a nested TableLayoutWidget emits update:modelValue, sync rows and selection into the cell's content.props. */
function handleNestedTableLayoutUpdate(rowIndex, colIndex, newModel) {
  if (!newModel) return;
  const hasRowsUpdate = Array.isArray(newModel.rows);
  const hasSelectionUpdate = "selectedRegionId" in newModel;
  if (!hasRowsUpdate && !hasSelectionUpdate) return;

  const newRows = localModel.value.rows.map((r, i) => {
    if (i !== rowIndex) return r;
    return {
      ...r,
      columns: (r.columns || []).map((c, j) => {
        if (j !== colIndex) return c;
        const cellProps = { ...(c.content?.props ?? {}) };
        if (hasRowsUpdate) {
          cellProps.rows = newModel.rows.map((row) => ({
            ...row,
            columns: Array.isArray(row.columns)
              ? row.columns.map((col) => ({ ...col }))
              : [],
          }));
        }
        if (hasSelectionUpdate)
          cellProps.selectedRegionId = newModel.selectedRegionId;
        return {
          ...c,
          content: { ...c.content, props: cellProps },
        };
      }),
    };
  });

  const updates = { rows: newRows };
  if (hasSelectionUpdate && newModel.selectedRegionId) {
    updates.selectedRegionId = undefined;
  }
  localModel.value = { ...localModel.value, ...updates };
}

/** Key for nested TableLayoutWidget so Vue re-renders it when row data (e.g. heights) changes and the child table updates. */
function getNestedTableRowsKey(col) {
  const rows = col?.content?.props?.rows;
  if (!Array.isArray(rows)) return "";
  return rows
    .map((r) => {
      const h = r?.height;
      if (!h) return "auto";
      if (h.kind === "fixed") return `fixed:${h.px ?? 100}`;
      if (h.kind === "percent") return `percent:${h.percent ?? "100%"}`;
      return "auto";
    })
    .join("|");
}

/** Props to pass when rendering a widget in a cell (preview mode). */
function getWidgetProps(col, row, rowIndex, colIndex) {
  const type = col.content?.type;
  const cellProps = col.content?.props ?? {};

  // Create update callback for widget properties
  const updateWidgetProps = (key, value) =>
    updateWidgetProperty(rowIndex, colIndex, key, value);

  // Create wrapped openPropertyEditor that includes update callback
  const wrappedOpenPropertyEditor = openPropertyEditor
    ? (propertySchema, opts = {}) => {
        openPropertyEditor(propertySchema, {
          ...opts,
          update: updateWidgetProps,
        });
      }
    : null;

  const baseProps = {
    ...cellProps,
    // Pass wrapped openPropertyEditor to all widgets so they can open PropertyGridWidget with update callback
    ...(wrappedOpenPropertyEditor && {
      openPropertyEditor: wrappedOpenPropertyEditor,
    }),
  };

  if (type === "GridLayoutWidget") {
    // Merge gridOptions with rows/columns from props if they exist
    const mergedGridOptions = {
      ...props.gridOptions,
      ...(cellProps.rows != null && { row: cellProps.rows }),
      ...(cellProps.columns != null && { column: cellProps.columns }),
      ...(cellProps.cellHeight != null &&
        cellProps.cellHeight !== "" && { cellHeight: cellProps.cellHeight }),
      ...(cellProps.cellWidth != null &&
        cellProps.cellWidth !== "" && { cellWidth: cellProps.cellWidth }),
    };
    return {
      ...baseProps,
      widgets: cellProps.widgets ?? [],
      updateWidget: () => {},
      gridOptions: mergedGridOptions,
      widgetComponents: resolvedContentWidgetComponents.value,
      gridDefaultsByType: props.gridDefaultsByType,
      sizeMode: "auto",
      backgroundColor: cellProps.backgroundColor ?? "",
      foregroundColor: cellProps.foregroundColor ?? "",
      editMode: editMode.value,
    };
  }
  if (type === "TableLayoutWidget") {
    const cellWidthPx =
      cellWidthsForNested.value[`${rowIndex}-${colIndex}`] ?? 0;
    return {
      ...baseProps,
      modelValue: {
        rows: cellProps.rows ?? [],
        ...(cellProps.selectedRegionId !== undefined && {
          selectedRegionId: cellProps.selectedRegionId,
        }),
      },
      widgetComponents: props.widgetComponents,
      contentWidgetComponents: props.contentWidgetComponents,
      gridDefaultsByType: props.gridDefaultsByType,
      gridOptions: props.gridOptions,
      ...(cellWidthPx > 0 && { cellWidthPx }),
    };
  }
  return baseProps;
}

/** Get wrapper style for widget preview based on widget docking and alignment properties. */
/** Wrapper fills the cell; alignment is applied on the td via text-align/vertical-align. */
function getWidgetPreviewWrapperStyle(col) {
  return {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  };
}

/** Widget dimensions: width/height/maxWidth (no flex). */
function getWidgetComponentStyle(col) {
  const cellProps = col.content?.props ?? {};
  const dock = cellProps.dock || "none";
  const horizontalAlignment = cellProps.horizontalAlignment || "center";

  if (dock !== "none") {
    switch (dock) {
      case "top":
      case "bottom":
        return { width: "100%", height: "auto", maxHeight: "100%", overflow: "auto" };
      case "left":
      case "right":
        return { width: "auto", height: "100%", maxWidth: "100%", overflow: "auto" };
      case "fill":
        return { width: "100%", height: "100%", overflow: "auto" };
      default:
        return { width: "100%", height: "100%", maxWidth: "100%", overflow: "auto" };
    }
  }

  const shouldStretch = horizontalAlignment === "center";
  return {
    width: shouldStretch ? "100%" : "auto",
    maxWidth: "100%",
    height: "auto",
    maxHeight: "100%",
    overflow: "auto",
  };
}

const route = useRoute();

// ============================================================================
// State
// ============================================================================

// PropertyGridWidget must be provided by parent view
const openPropertyEditor = inject("openPropertyEditor", null);
if (!openPropertyEditor) {
  console.warn(
    "TableLayoutWidget: openPropertyEditor not provided. PropertyGridWidget may not work for widgets.",
  );
}

// WidgetsSelectorWidget must be provided by parent view
const openWidgetsSelector = inject("openWidgetsSelector", null);
const closeWidgetsSelectorFn = inject("closeWidgetsSelector", null);
const onWidgetSelected = inject("onWidgetSelected", null);
if (!openWidgetsSelector) {
  console.warn(
    "TableLayoutWidget: openWidgetsSelector not provided. WidgetsSelectorWidget may not work.",
  );
}

// Expose function for parent to call when widget is selected (via template ref)
defineExpose({
  addWidgetToSelectedRegion,
});

// edit=1 in URL query → edit mode; otherwise preview mode
const editMode = computed(() => route.query.edit === "1");

// Widgets Selector opens only when plus icon is clicked (not cog/settings)
const widgetsSelectorRegionId = ref(null);

// Unique prefix for offcanvas input IDs so parent and nested tables don't share IDs (fixes radio/checkbox behavior)
const offcanvasIdPrefix = ref("tl-" + Math.random().toString(36).slice(2, 11));

// Z-index for offcanvas: nested tables use higher values so child offcanvas appears above parent's
const parentOffcanvasZ = inject("tableLayoutOffcanvasZIndex", null);
const isNestedTable = parentOffcanvasZ != null;
const offcanvasZIndex = isNestedTable ? parentOffcanvasZ + 1 : 9999;
provide("tableLayoutOffcanvasZIndex", offcanvasZIndex);

// Local editing state for row height inputs (updates immediately; also emit to parent for nested tables)
const rowHeightPx = ref(100);
const rowHeightPercent = ref("100%");
const rowHeightPercentNum = ref(100);
const colColspanInput = ref(1);
const colWidthPxInput = ref(200);
const colWidthPctInput = ref(30);

// ============================================================================
// Computed
// ============================================================================

const localModel = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const gridTemplateRows = computed(() => {
  if (
    !localModel.value ||
    !localModel.value.rows ||
    localModel.value.rows.length === 0
  ) {
    return "auto";
  }
  const rows = localModel.value.rows;

  // Calculate total fixed px space
  const fixedPxTotal = rows.reduce((sum, row) => {
    return sum + (row.height.kind === "fixed" ? row.height.px : 0);
  }, 0);

  // Get all percent rows and their values
  const percentRows = rows
    .map((row, index) => ({
      index,
      row,
      percent:
        row.height.kind === "percent"
          ? parseFloat(row.height.percent) || 100
          : null,
    }))
    .filter((item) => item.percent !== null);

  // Calculate total percent (for normalization if sum != 100)
  const totalPercent = percentRows.reduce((sum, item) => sum + item.percent, 0);

  // Build grid template rows
  return rows
    .map((row) => {
      if (row.height.kind === "fixed") {
        return `${row.height.px}px`;
      }
      if (row.height.kind === "percent") {
        const percentValue = parseFloat(row.height.percent) || 100;
        // Normalize percentage if total doesn't equal 100%
        const normalizedPercent =
          totalPercent > 0 && totalPercent !== 100
            ? (percentValue / totalPercent) * 100
            : percentValue;
        // Nested tables: percent of container (Region cell). Root: percent of viewport.
        if (isNestedTable) {
          if (fixedPxTotal > 0) {
            return `calc((100% - ${fixedPxTotal}px) * ${normalizedPercent} / 100)`;
          }
          return `${normalizedPercent}%`;
        }
        const vhReserve = "6.7rem";
        return `calc((100vh - ${vhReserve} - ${fixedPxTotal}px) * ${normalizedPercent} / 100)`;
      }
      return "auto";
    })
    .join(" ");
});

const percentRowCount = computed(() => {
  if (!localModel.value || !localModel.value.rows) return 0;
  return localModel.value.rows.filter((r) => r.height.kind === "percent")
    .length;
});

const canAddRow = computed(() => {
  if (!localModel.value || !localModel.value.rows) return true;
  return localModel.value.rows.length < 20;
});
const canRemoveRow = computed(() => {
  if (!localModel.value || !localModel.value.rows) return false;
  return localModel.value.rows.length > 1;
});

const hasSelectedRow = computed(() => {
  return getSelectedRowIndex() >= 0;
});

const selectedRowIndex = computed(() => {
  return getSelectedRowIndex();
});

const isRowSelected = computed(() => {
  if (!localModel.value || !localModel.value.selectedRegionId) return false;
  if (!localModel.value.rows) return false;
  // Check if selectedRegionId is a row ID (not a column region)
  return localModel.value.rows.some(
    (row) => row.id === localModel.value.selectedRegionId,
  );
});

const selectedRow = computed(() => {
  if (!localModel.value || !localModel.value.rows) return null;
  const index = selectedRowIndex.value;
  if (index >= 0 && index < localModel.value.rows.length) {
    return localModel.value.rows[index];
  }
  return null;
});

// Load row height inputs when selected row changes (display only; Apply applies)
watch(
  () => [selectedRow.value?.id, selectedRow.value?.height],
  () => {
    const row = selectedRow.value;
    if (row?.height) {
      rowHeightPx.value =
        row.height.kind === "fixed" ? (row.height.px ?? 100) : 100;
      rowHeightPercent.value =
        row.height.kind === "percent" ? (row.height.percent ?? "100%") : "100%";
      rowHeightPercentNum.value = parseFloat(rowHeightPercent.value) || 100;
    }
  },
  { immediate: true },
);

const selectedColumnIndex = computed(() => {
  return getSelectedColumnIndex();
});

const isColumnSelected = computed(() => {
  if (!localModel.value.selectedRegionId) return false;
  // Check if selectedRegionId is a column region (format: rowId-col-X)
  return /^.+-col-\d+$/.test(localModel.value.selectedRegionId);
});

const selectedColumn = computed(() => {
  if (!isColumnSelected.value) return null;
  const rowIndex = getSelectedRowIndex();
  const colIndex = getSelectedColumnIndex();
  if (rowIndex < 0 || colIndex < 0) return null;
  const row = localModel.value.rows[rowIndex];
  if (
    !row ||
    !row.columns ||
    !Array.isArray(row.columns) ||
    colIndex >= row.columns.length
  )
    return null;
  const columnSpec = row.columns[colIndex];
  let columnValue = null;
  if (columnSpec.kind === "fixed") {
    columnValue = columnSpec.px;
  } else if (columnSpec.kind === "percent") {
    columnValue = columnSpec.percent;
  }
  const cols = row.columns;
  let colStart = 1;
  for (let i = 0; i < colIndex; i++) {
    colStart += Math.max(1, cols[i].colspan ?? 1);
  }
  const colspan = Math.max(1, columnSpec.colspan ?? 1);
  const maxColspan = Math.max(1, maxColumns.value - colStart + 1);
  return {
    rowIndex,
    colIndex,
    row,
    columnSpec,
    columnValue,
    colspan,
    maxColspan,
    allColumns: row.columns,
  };
});

watch(
  () => selectedColumn.value?.colspan ?? 1,
  (val) => {
    colColspanInput.value = val;
  },
  { immediate: true },
);

watch(
  () => selectedColumn.value,
  (info) => {
    if (!info) return;
    if (info.columnSpec?.kind === "fixed") {
      colWidthPxInput.value = info.columnValue ?? 200;
    }
    if (info.columnSpec?.kind === "percent") {
      colWidthPctInput.value = info.columnValue ?? 30;
    }
  },
  { immediate: true },
);

/** Global column count: max grid tracks across all rows (sum of colspans per row). All rows share the same column tracks. */
const maxColumns = computed(() => {
  const rows = localModel.value?.rows;
  if (!rows || rows.length === 0) return 1;
  return Math.max(
    1,
    ...rows.map((r) => {
      const cols = r.columns && Array.isArray(r.columns) ? r.columns : [];
      return cols.reduce((sum, c) => sum + Math.max(1, c.colspan ?? 1), 0);
    }),
  );
});

/**
 * Single shared grid template for columns. Derived from all rows so column lines align vertically.
 *
 * Global column rule (chosen for stability and predictability):
 * - maxColumns = max column count across all rows; all rows share the same tracks.
 * - For each column index i: if ANY row has fixed at i → use max(px) so no content is clipped;
 *   else if ANY row has percent at i → use normalized percent (sum to 100%);
 *   percent tracks: calc((100% - fixedTotalPx) * p/100) when fixed columns exist, else p%.
 * - Else (all auto at i) → 1fr.
 * This prevents per-row column shifting and keeps a table-like alignment.
 */
const globalGridTemplateColumns = computed(() => {
  const rows = localModel.value?.rows ?? [];
  const n = maxColumns.value;
  if (n === 0) return "1fr";

  const fixedPxByIndex = [];
  const percentByIndex = [];
  let hasAutoByIndex = false;
  for (let i = 0; i < n; i++) {
    let maxPx = 0;
    const percents = [];
    let hasAuto = false;
    for (const row of rows) {
      const col = getColumnSpecAtTrack(row, i);
      if (!col) continue;
      if (col.kind === "fixed") {
        maxPx = Math.max(maxPx, col.px ?? 200);
      } else       if (col.kind === "percent") {
        const val = col.percent ?? 30;
        percents.push(typeof val === "number" ? val : parseFloat(val) || 30);
      } else {
        hasAuto = true;
      }
    }
    fixedPxByIndex.push(maxPx);
    percentByIndex.push(percents.length ? Math.max(...percents) : 0);
    if (hasAuto) hasAutoByIndex = true;
  }

  const fixedTotalPx = fixedPxByIndex.reduce((a, b) => a + b, 0);
  const percentSum = percentByIndex.reduce((a, b) => a + b, 0);
  const normalizePct =
    percentSum > 0 && percentSum !== 100 ? 100 / percentSum : 1;

  const parts = [];
  for (let i = 0; i < n; i++) {
    if (fixedPxByIndex[i] > 0) {
      parts.push(`${fixedPxByIndex[i]}px`);
    } else if (percentByIndex[i] > 0) {
      const p = percentByIndex[i] * normalizePct;
      if (fixedTotalPx > 0) {
        parts.push(`calc((100% - ${fixedTotalPx}px) * ${p} / 100)`);
      } else {
        parts.push(`${p}%`);
      }
    } else {
      parts.push("1fr");
    }
  }
  return parts.join(" ");
});

/**
 * When cellWidthPx is set (nested table inside a measured grid cell), compute column template
 * in pixels so percent columns resolve relative to the parent cell width. Same track logic as
 * globalGridTemplateColumns; rounding: Math.floor for percent tracks except last, last gets remainder.
 */
const pixelGridTemplateColumns = computed(() => {
  const cellWidthPx = props.cellWidthPx ?? 0;
  if (cellWidthPx <= 0) return null;

  const rows = localModel.value?.rows ?? [];
  const n = maxColumns.value;
  if (n === 0) return "1fr";

  const fixedPxByIndex = [];
  const percentByIndex = [];
  for (let i = 0; i < n; i++) {
    let maxPx = 0;
    const percents = [];
    for (const row of rows) {
      const col = getColumnSpecAtTrack(row, i);
      if (!col) continue;
      if (col.kind === "fixed") {
        maxPx = Math.max(maxPx, col.px ?? 200);
      } else if (col.kind === "percent") {
        const val = col.percent ?? 30;
        percents.push(typeof val === "number" ? val : parseFloat(val) || 30);
      }
    }
    fixedPxByIndex.push(maxPx);
    percentByIndex.push(percents.length ? Math.max(...percents) : 0);
  }

  const fixedTotalPx = fixedPxByIndex.reduce((a, b) => a + b, 0);
  const percentSum = percentByIndex.reduce((a, b) => a + b, 0);
  const normalizePct =
    percentSum > 0 && percentSum !== 100 ? 100 / percentSum : 1;

  const remaining = Math.max(0, cellWidthPx - fixedTotalPx);
  const percentIndices = [];
  for (let i = 0; i < n; i++) {
    if (fixedPxByIndex[i] === 0 && percentByIndex[i] > 0) percentIndices.push(i);
  }
  const percentWidths = {};
  if (percentIndices.length > 0 && remaining > 0) {
    let used = 0;
    for (let i = 0; i < percentIndices.length - 1; i++) {
      const idx = percentIndices[i];
      const p = percentByIndex[idx] * normalizePct;
      const w = Math.floor((remaining * p) / 100);
      percentWidths[idx] = w;
      used += w;
    }
    percentWidths[percentIndices[percentIndices.length - 1]] = remaining - used;
  }

  const parts = [];
  for (let i = 0; i < n; i++) {
    if (fixedPxByIndex[i] > 0) {
      parts.push(`${fixedPxByIndex[i]}px`);
    } else if (percentByIndex[i] > 0 && percentWidths[i] != null) {
      parts.push(`${percentWidths[i]}px`);
    } else {
      parts.push("1fr");
    }
  }
  return parts.join(" ");
});

/** Column widths as array for table <col> elements (same logic as pixel/global template). */
const tableColumnWidthsArray = computed(() => {
  const parts = [];
  const rows = localModel.value?.rows ?? [];
  const n = maxColumns.value;
  if (n === 0) return ["1fr"];

  const fixedPxByIndex = [];
  const percentByIndex = [];
  for (let i = 0; i < n; i++) {
    let maxPx = 0;
    const percents = [];
    let hasAuto = false;
    for (const row of rows) {
      const col = getColumnSpecAtTrack(row, i);
      if (!col) continue;
      if (col.kind === "fixed") {
        maxPx = Math.max(maxPx, col.px ?? 200);
      } else if (col.kind === "percent") {
        const val = col.percent ?? 30;
        percents.push(typeof val === "number" ? val : parseFloat(val) || 30);
      } else {
        hasAuto = true;
      }
    }
    fixedPxByIndex.push(maxPx);
    percentByIndex.push(percents.length ? Math.max(...percents) : 0);
  }

  const fixedTotalPx = fixedPxByIndex.reduce((a, b) => a + b, 0);
  const percentSum = percentByIndex.reduce((a, b) => a + b, 0);
  const normalizePct =
    percentSum > 0 && percentSum !== 100 ? 100 / percentSum : 1;
  const cellWidthPx = props.cellWidthPx ?? 0;

  if (cellWidthPx > 0) {
    const remaining = Math.max(0, cellWidthPx - fixedTotalPx);
    const percentIndices = [];
    for (let i = 0; i < n; i++) {
      if (fixedPxByIndex[i] === 0 && percentByIndex[i] > 0)
        percentIndices.push(i);
    }
    const percentWidths = {};
    if (percentIndices.length > 0 && remaining > 0) {
      let used = 0;
      for (let i = 0; i < percentIndices.length - 1; i++) {
        const idx = percentIndices[i];
        const p = percentByIndex[idx] * normalizePct;
        const w = Math.floor((remaining * p) / 100);
        percentWidths[idx] = w;
        used += w;
      }
      percentWidths[percentIndices[percentIndices.length - 1]] = remaining - used;
    }
    for (let i = 0; i < n; i++) {
      if (fixedPxByIndex[i] > 0) parts.push(`${fixedPxByIndex[i]}px`);
      else if (percentByIndex[i] > 0 && percentWidths[i] != null)
        parts.push(`${percentWidths[i]}px`);
      else parts.push("1fr");
    }
  } else {
    for (let i = 0; i < n; i++) {
      if (fixedPxByIndex[i] > 0) {
        parts.push(`${fixedPxByIndex[i]}px`);
      } else if (percentByIndex[i] > 0) {
        const p = percentByIndex[i] * normalizePct;
        if (fixedTotalPx > 0) {
          parts.push(`calc((100% - ${fixedTotalPx}px) * ${p} / 100)`);
        } else {
          parts.push(`${p}%`);
        }
      } else {
        parts.push("1fr");
      }
    }
  }
  return parts;
});

/** Row heights as array for table <tr> style (same logic as gridTemplateRows). */
const tableRowHeightsArray = computed(() => {
  if (
    !localModel.value?.rows ||
    localModel.value.rows.length === 0
  ) {
    return [];
  }
  const rows = localModel.value.rows;
  const fixedPxTotal = rows.reduce((sum, row) => {
    return sum + (row.height?.kind === "fixed" ? row.height.px : 0);
  }, 0);
  const percentRows = rows
    .map((row, index) => ({
      index,
      row,
      percent:
        row.height?.kind === "percent"
          ? parseFloat(row.height.percent) || 100
          : null,
    }))
    .filter((item) => item.percent !== null);
  const totalPercent = percentRows.reduce((sum, item) => sum + item.percent, 0);

  return rows.map((row) => {
    if (row.height?.kind === "fixed") return `${row.height.px}px`;
    if (row.height?.kind === "percent") {
      const percentValue = parseFloat(row.height.percent) || 100;
      const normalizedPercent =
        totalPercent > 0 && totalPercent !== 100
          ? (percentValue / totalPercent) * 100
          : percentValue;
      if (isNestedTable) {
        if (fixedPxTotal > 0) {
          return `calc((100% - ${fixedPxTotal}px) * ${normalizedPercent} / 100)`;
        }
        return `${normalizedPercent}%`;
      }
      const vhReserve = "6.7rem";
      return `calc((100vh - ${vhReserve} - ${fixedPxTotal}px) * ${normalizedPercent} / 100)`;
    }
    return "auto";
  });
});

function getTableRowStyle(row, rowIndex) {
  const arr = tableRowHeightsArray.value;
  const h = rowIndex >= 0 && rowIndex < arr.length ? arr[rowIndex] : "auto";
  return h && h !== "auto" ? { height: h } : {};
}

const previewCanvasStyle = computed(() => ({
  height: isNestedTable ? "100%" : "calc(100vh - 6.7rem)",
  maxHeight: isNestedTable ? "100%" : "calc(100vh - 6.7rem)",
  minHeight: isNestedTable ? 0 : undefined,
  width: isNestedTable ? "100%" : undefined,
  minWidth: isNestedTable ? "100%" : undefined,
  border: "1px solid #dee2e6",
  backgroundColor: "#f8f9fa",
  position: "relative",
  overflow: "hidden",
}));

const tableStyle = computed(() => ({
  width: "100%",
  tableLayout: "fixed",
  height: isNestedTable ? "100%" : undefined,
  borderCollapse: "collapse",
  borderSpacing: 0,
}));

// ============================================================================
// Helper Functions
// ============================================================================

function generateRowId() {
  return `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getRegionId(rowId, colIndex) {
  return colIndex !== undefined ? `${rowId}-col-${colIndex}` : rowId;
}

function getColumnTemplate(columns) {
  if (!columns || !Array.isArray(columns) || columns.length === 0) return "1fr";

  // Calculate total fixed px space
  const fixedTotal = columns.reduce((sum, col) => {
    return sum + (col.kind === "fixed" ? col.px || 0 : 0);
  }, 0);

  // Calculate total percent (for normalization if sum != 100)
  const percentColumns = columns.filter((col) => col.kind === "percent");
  const percentTotal = percentColumns.reduce(
    (sum, col) => sum + (col.percent || 0),
    0,
  );

  // Count auto columns
  const autoCount = columns.filter((col) => col.kind === "auto").length;

  // Build grid template columns
  return columns
    .map((col) => {
      if (col.kind === "fixed") {
        return `${col.px || 200}px`;
      }
      if (col.kind === "percent") {
        const percentValue = col.percent || 30;
        // Normalize percentage if total doesn't equal 100%
        const normalizedPercent =
          percentTotal > 0 && percentTotal !== 100 && autoCount === 0
            ? (percentValue / percentTotal) * 100
            : percentValue;
        // Use calc to get percentage of remaining space after fixed columns
        if (fixedTotal > 0) {
          return `calc((100% - ${fixedTotal}px) * ${normalizedPercent} / 100)`;
        } else {
          return `${normalizedPercent}%`;
        }
      }
      if (col.kind === "auto") {
        // Auto columns take remaining space - use 1fr if there are percent columns, otherwise auto
        if (percentColumns.length > 0 || fixedTotal > 0) {
          return "1fr";
        }
        return "auto";
      }
      // Default to 1fr
      return "1fr";
    })
    .join(" ");
}

// Preview area – Edit Mode vs Preview Mode comparison
//
// ============================================================================
// ROW SELECTION (via getCellStyle when selectedRegionId === row.id)
// ============================================================================
// All cells in the row get the same styling. Applied per-cell, no separate row element.
//
// Row Selection (when selectedRegionId === row.id):
//   Property          | Edit Mode                    | Preview Mode
//   ------------------|------------------------------|------------------
//   border            | 2px solid #dc3545 (red)      | (no selection)
//   boxShadow         | 0 0 0 0.2rem rgba(220, 53, 69, 0.25) | (no selection)
//   Hover override    | Red border maintained via CSS | (no selection)
//
// ============================================================================
// CELLS (getCellStyle)
// ============================================================================
//   Property          | Edit Mode                    | Preview Mode
//   ------------------|------------------------------|------------------
//   border            | 2px dashed #adb5bd           | none
//   backgroundColor   | transparent                  | transparent
//   padding           | 4px                          | 4px
//
// Cell Selection (when selectedRegionId === rowId-col-N):
//   Property          | Edit Mode                    | Preview Mode
//   ------------------|------------------------------|------------------
//   border            | 2px solid #0d6efd (blue)     | (no selection)
//   boxShadow         | 0 0 0 0.2rem rgba(13, 110, 253, 0.25) | (no selection)
//   Hover override    | Blue border maintained via CSS | (no selection)
//
// ============================================================================
// UI ELEMENTS VISIBILITY
// ============================================================================
//   Element              | Edit Mode                    | Preview Mode
//   ---------------------|------------------------------|------------------
//   Region labels        | Visible ("Region X-Y")       | Hidden
//   Empty cell           | Shows Region label + gear/plus buttons | Hidden
//   Row settings gear    | Visible (first cell)         | Hidden
//   Cell settings gear   | Visible (each cell)          | Hidden
//   Add Widget plus      | Visible (each cell)          | Hidden
//   Row Settings offcanvas| Visible when row selected   | Hidden
//   Column Settings offcanvas| Visible when cell selected | Hidden
//   Widget Selector offcanvas| Visible when plus clicked | Hidden
//
// ============================================================================
// CELL CONTENT DISPLAY
// ============================================================================
//   Cell State           | Edit Mode                    | Preview Mode
//   ---------------------|------------------------------|------------------
//   Empty cell           | Shows Region label           | (empty, no content)
//   Cell with widget     | Shows widget component       | Shows widget component
//   Cell with invalid widget| Shows widget type name    | Shows widget type name
//
// ============================================================================
// INTERACTIONS
// ============================================================================
//   Action               | Edit Mode                    | Preview Mode
//   ---------------------|------------------------------|------------------
//   Row settings gear    | Selects row (red border)     | No selection
//   Cell settings gear   | Selects cell (blue border)   | No selection
//   Add Widget plus      | Opens Widget Selector        | No action
//   Widget click         | Opens Property Grid          | No action
//
// ============================================================================
// CSS HOVER BEHAVIOR
// ============================================================================
//   State                | Border Color                 | Notes
//   ---------------------|------------------------------|------------------
//   Default hover        | #adb5bd (gray)               | Applies to both modes
//   Selected row hover   | #dc3545 (red) !important     | Overrides default hover
//   Selected cell hover  | #0d6efd (blue) !important    | Overrides default hover
//
// ============================================================================
// ACTIVATION
// ============================================================================
//   Mode                 | Trigger                      | URL Query Param
//   ---------------------|------------------------------|------------------
//   Edit Mode            | editMode = true              | ?edit=1
//   Preview Mode         | editMode = false             | ?edit=0 or omitted

/** Get the column spec that covers a given grid track index in a row (accounts for colspan). */
function getColumnSpecAtTrack(row, trackIndex) {
  const cols = row.columns && Array.isArray(row.columns) ? row.columns : [];
  let pos = 0;
  for (const col of cols) {
    const span = Math.max(1, col.colspan ?? 1);
    if (trackIndex >= pos && trackIndex < pos + span) return col;
    pos += span;
  }
  return null;
}

/** Grid placement for a cell in the shared grid: gridRow and gridColumn (accounts for colspan). */
function getCellPlacement(row, rowIndex, colIndex) {
  const cols = row.columns && Array.isArray(row.columns) ? row.columns : [];
  const maxCols = maxColumns.value;
  let colStart = 1;
  for (let i = 0; i < colIndex; i++) {
    colStart += Math.max(1, cols[i].colspan ?? 1);
  }
  const span = Math.max(1, cols[colIndex]?.colspan ?? 1);
  const colEnd = Math.min(colStart + span, maxCols + 1);
  return {
    gridRow: rowIndex + 1,
    gridColumn: `${colStart} / ${colEnd}`,
  };
}

const textAlignMap = { start: "left", center: "center", end: "right" };
const verticalAlignMap = { start: "top", center: "middle", end: "bottom" };

function getCellStyle(row, colIndex) {
  const col = row.columns?.[colIndex];
  const cellProps = col?.content?.props ?? {};
  const style = {
    padding: "4px",
    backgroundColor: "transparent",
    minHeight: "0",
    minWidth: "0",
    position: editMode.value ? "relative" : "static",
    overflow: "hidden",
    textAlign: textAlignMap[cellProps.horizontalAlignment] ?? "center",
    verticalAlign: verticalAlignMap[cellProps.verticalAlignment] ?? "top",
  };

  // Border styling - all handled via inline styles
  if (!editMode.value) {
    style.border = "none";
  } else {
    const rowRegionId = getRegionId(row.id);
    const cellRegionId = getRegionId(row.id, colIndex);
    const selected = localModel.value.selectedRegionId;

    if (selected === cellRegionId) {
      // Selected cell: blue solid border
      style.border = "2px solid #0d6efd";
      style.boxShadow = "0 0 0 0.2rem rgba(13, 110, 253, 0.25)";
    } else if (selected === rowRegionId) {
      // Selected row: red solid border
      style.border = "2px solid #dc3545";
      style.boxShadow = "0 0 0 0.2rem rgba(220, 53, 69, 0.25)";
    } else {
      // Unselected: dashed border
      style.border = "2px dashed #adb5bd";
    }
  }

  return style;
}

/** Style for empty row cell (no columns) - same row selection logic as regular cells. */
function getEmptyCellStyle(row) {
  const style = {
    minHeight: "0",
    minWidth: "0",
    overflow: "hidden",
    textAlign: "center",
    verticalAlign: "middle",
  };

  // Border styling - all handled via inline styles
  if (!editMode.value) {
    style.border = "none";
  } else {
    const rowRegionId = getRegionId(row.id);
    const selected = localModel.value.selectedRegionId;

    if (selected === rowRegionId) {
      // Selected row: red solid border
      style.border = "2px solid #dc3545";
      style.boxShadow = "0 0 0 0.2rem rgba(220, 53, 69, 0.25)";
    } else {
      // Unselected: dashed border
      style.border = "2px dashed #adb5bd";
    }
  }

  return style;
}

// ============================================================================
// Actions
// ============================================================================

function getSelectedRowIndex() {
  if (!localModel.value.selectedRegionId) return -1;

  // Check if selectedRegionId is a row ID (not a column region)
  const rowIndex = localModel.value.rows.findIndex(
    (row) => row.id === localModel.value.selectedRegionId,
  );
  if (rowIndex >= 0) return rowIndex;

  // Check if selectedRegionId is a column region (format: rowId-col-X)
  const match = localModel.value.selectedRegionId.match(/^(.+)-col-(\d+)$/);
  if (match) {
    const rowId = match[1];
    return localModel.value.rows.findIndex((row) => row.id === rowId);
  }

  return -1;
}

function getSelectedColumnIndex() {
  if (!localModel.value.selectedRegionId) return -1;

  // Check if selectedRegionId is a column region (format: rowId-col-X)
  const match = localModel.value.selectedRegionId.match(/^.+-col-(\d+)$/);
  if (match) {
    return parseInt(match[1], 10);
  }

  return -1;
}

function getColumnInfoFromRegionId(regionId) {
  if (!regionId || !/^.+-col-\d+$/.test(regionId)) return null;
  const match = regionId.match(/^(.+)-col-(\d+)$/);
  const rowId = match[1];
  const colIndex = parseInt(match[2], 10);
  const rowIndex =
    localModel.value?.rows?.findIndex((r) => r.id === rowId) ?? -1;
  if (rowIndex < 0) return null;
  const row = localModel.value.rows[rowIndex];
  if (
    !row ||
    !row.columns ||
    !Array.isArray(row.columns) ||
    colIndex >= row.columns.length
  )
    return null;
  const columnSpec = row.columns[colIndex];
  let columnValue = null;
  if (columnSpec.kind === "fixed") {
    columnValue = columnSpec.px;
  } else if (columnSpec.kind === "percent") {
    columnValue = columnSpec.percent;
  }
  const cols = row.columns;
  let colStart = 1;
  for (let i = 0; i < colIndex; i++) {
    colStart += Math.max(1, cols[i].colspan ?? 1);
  }
  const colspan = Math.max(1, columnSpec.colspan ?? 1);
  const maxColspan = Math.max(1, maxColumns.value - colStart + 1);
  return {
    rowIndex,
    colIndex,
    row,
    columnSpec,
    columnValue,
    colspan,
    maxColspan,
    allColumns: row.columns,
  };
}

/** Default props when adding a widget to a region (by type). */
function getDefaultPropsForWidgetType(type) {
  switch (type) {
    case "IconValueWidget":
      return {
        identifier: generateWidgetIdentifier("IconValueWidget"),
        value: "--",
        label: "",
        icon: "fa-chart-simple",
        iconColor: "steelblue",
      };
    case "GridLayoutWidget":
      return {
        identifier: generateWidgetIdentifier("GridLayoutWidget"),
        widgets: [],
        cellHeight: "70px",
        cellWidth: "120px",
      };
    case "ValueWidget":
      return {
        identifier: generateWidgetIdentifier("ValueWidget"),
        value: "--",
        label: "",
      };
    case "TableLayoutWidget":
      return {
        identifier: generateWidgetIdentifier("TableLayoutWidget"),
        rows: [
          {
            id: generateRowId(),
            height: { kind: "percent", percent: "50%" },
            columns: [{ kind: "auto" }, { kind: "auto" }],
          },
          {
            id: generateRowId(),
            height: { kind: "percent", percent: "50%" },
            columns: [{ kind: "auto" }, { kind: "auto" }],
          },
        ],
      };
    default:
      return {
        identifier: generateWidgetIdentifier(type),
      };
  }
}

function addWidgetToSelectedRegion(widgetType) {
  const info = getColumnInfoFromRegionId(widgetsSelectorRegionId.value);
  if (!info) return;
  const { rowIndex, colIndex, row, columnSpec, allColumns } = info;
  const newColumns = allColumns.map((col, i) =>
    i === colIndex
      ? {
          ...col,
          content: {
            type: widgetType,
            props: getDefaultPropsForWidgetType(widgetType),
          },
        }
      : { ...col },
  );
  const newRows = localModel.value.rows.map((r, i) =>
    i === rowIndex ? { ...r, columns: newColumns } : { ...r },
  );
  localModel.value = { ...localModel.value, rows: newRows };
  closeWidgetsSelector();
}

function openWidgetsSelectorHandler(regionId) {
  widgetsSelectorRegionId.value = regionId;
  // Close Row/Column Settings offcanvas
  localModel.value = {
    ...localModel.value,
    selectedRegionId: undefined,
  };
  // Call injected openWidgetsSelector function (pass callback so view calls this instance's addWidgetToSelectedRegion for nested tables)
  if (openWidgetsSelector) {
    const info = getColumnInfoFromRegionId(regionId);
    if (widgetsByGroup.value) {
      openWidgetsSelector(widgetsByGroup.value, info || null, (widgetType) =>
        addWidgetToSelectedRegion(widgetType),
      );
    } else {
      console.warn(
        "TableLayoutWidget: Cannot open WidgetsSelector - widgetsByGroup is missing",
        { widgetsByGroup: widgetsByGroup.value },
      );
    }
  } else {
    console.warn("TableLayoutWidget: openWidgetsSelector not provided");
  }
}

function openWidgetsSelectorAndSelectCell(regionId) {
  // Open the Widget Selector only; do not set selectedRegionId (would open Cell Settings offcanvas)
  widgetsSelectorRegionId.value = regionId;
  if (openWidgetsSelector && widgetsByGroup.value) {
    const info = getColumnInfoFromRegionId(regionId);
    openWidgetsSelector(widgetsByGroup.value, info || null, (widgetType) =>
      addWidgetToSelectedRegion(widgetType),
    );
  }
}

function addRow() {
  if (!canAddRow.value) return;
  const newRow = {
    id: generateRowId(),
    height: { kind: "auto" },
    columns: [{ kind: "auto" }, { kind: "auto" }, { kind: "auto" }],
  };
  const selectedRowIndex = getSelectedRowIndex();
  const newRows = [...localModel.value.rows];
  if (selectedRowIndex >= 0) {
    newRows.splice(selectedRowIndex + 1, 0, newRow);
  } else {
    newRows.push(newRow);
  }
  localModel.value = { ...localModel.value, rows: newRows };
}

function addRowAbove() {
  if (!canAddRow.value || selectedRowIndex.value < 0) return;
  const row = localModel.value.rows[selectedRowIndex.value];
  const columnSpecs =
    row.columns && Array.isArray(row.columns)
      ? row.columns.map((col) => ({
          kind: col.kind ?? "auto",
          ...(col.colspan != null && { colspan: col.colspan }),
        }))
      : [{ kind: "auto" }, { kind: "auto" }, { kind: "auto" }];
  const height =
    row.height && row.height.kind ? { ...row.height } : { kind: "auto" };
  const newRow = {
    id: generateRowId(),
    height,
    columns: columnSpecs,
  };
  const newRows = [...localModel.value.rows];
  newRows.splice(selectedRowIndex.value, 0, newRow);
  localModel.value = { ...localModel.value, rows: newRows };
}

function addRowBelow() {
  if (!canAddRow.value || selectedRowIndex.value < 0) return;
  const row = localModel.value.rows[selectedRowIndex.value];
  const columnSpecs =
    row.columns && Array.isArray(row.columns)
      ? row.columns.map((col) => ({
          kind: col.kind ?? "auto",
          ...(col.colspan != null && { colspan: col.colspan }),
        }))
      : [{ kind: "auto" }, { kind: "auto" }, { kind: "auto" }];
  const height =
    row.height && row.height.kind ? { ...row.height } : { kind: "auto" };
  const newRow = {
    id: generateRowId(),
    height,
    columns: columnSpecs,
  };
  const newRows = [...localModel.value.rows];
  newRows.splice(selectedRowIndex.value + 1, 0, newRow);
  localModel.value = { ...localModel.value, rows: newRows };
}

function addColumn() {
  const selectedRowIndex = getSelectedRowIndex();
  if (selectedRowIndex < 0) return;

  const selectedColIndex = getSelectedColumnIndex();
  const insertIndex =
    selectedColIndex >= 0 ? selectedColIndex + 1 : maxColumns.value;
  const newColumn = { kind: "auto" };

  const newRows = localModel.value.rows.map((row) => {
    const cols =
      row.columns && Array.isArray(row.columns) ? [...row.columns] : [];
    if (insertIndex <= cols.length) {
      cols.splice(insertIndex, 0, newColumn);
    } else {
      while (cols.length < insertIndex) cols.push({ kind: "auto" });
      cols.push(newColumn);
    }
    return { ...row, columns: cols };
  });

  const row = newRows[selectedRowIndex];
  localModel.value = {
    ...localModel.value,
    rows: newRows,
    selectedRegionId: getRegionId(row.id, insertIndex),
  };
}

function removeRow(index) {
  if (!canRemoveRow.value || index < 0 || index >= localModel.value.rows.length)
    return;

  const newRows = [...localModel.value.rows];
  newRows.splice(index, 1);

  // Keep offcanvas open: select the row that took this index, or the one above
  const newIndex = Math.min(index, newRows.length - 1);
  const selectedRegionId = newIndex >= 0 ? newRows[newIndex].id : undefined;

  localModel.value = {
    ...localModel.value,
    rows: newRows,
    selectedRegionId,
  };
}

function updateRowType(index, height) {
  const newRows = [...localModel.value.rows];

  // No special handling needed for percent rows - multiple are allowed

  newRows[index] = { ...newRows[index], height };

  localModel.value = {
    ...localModel.value,
    rows: newRows,
  };
}

function toggleColumns(index) {
  const newRows = [...localModel.value.rows];
  const row = newRows[index];

  if (row.columns && Array.isArray(row.columns) && row.columns.length > 0) {
    delete row.columns;
  } else {
    row.columns = [{ kind: "auto" }, { kind: "auto" }, { kind: "auto" }];
  }
  localModel.value = {
    ...localModel.value,
    rows: newRows,
  };
}

function updateColumnSpec(index, spec) {
  const newRows = [...localModel.value.rows];
  const row = newRows[index];
  if (spec.kind === "equal") {
    row.columns = Array(spec.count || 3)
      .fill(0)
      .map(() => ({ kind: "auto" }));
  } else if (spec.kind === "fixed") {
    row.columns = (spec.px || [200, 300]).map((px) => ({ kind: "fixed", px }));
  } else if (spec.kind === "auto") {
    row.columns = Array(spec.count || 3)
      .fill(0)
      .map(() => ({ kind: "auto" }));
  }
  localModel.value = { ...localModel.value, rows: newRows };
}

function updateColumnType(rowIndex, colIndex, newType, defaultValue) {
  const newRows = localModel.value.rows.map((r, i) => {
    if (i !== rowIndex) return r;
    const columns = (r.columns || []).map((c, j) => {
      if (j !== colIndex) return c;
      const newColumnSpec = { kind: newType };
      if (newType === "fixed") {
        newColumnSpec.px = defaultValue !== undefined ? defaultValue : 200;
      } else if (newType === "percent") {
        newColumnSpec.percent = defaultValue !== undefined ? defaultValue : 30;
      }
      if (c.colspan != null) newColumnSpec.colspan = c.colspan;
      if (c.content != null) newColumnSpec.content = c.content;
      return newColumnSpec;
    });
    return { ...r, columns };
  });
  localModel.value = { ...localModel.value, rows: newRows };
}

function selectRegion(regionId) {
  // Close Widgets Selector offcanvas when opening Row or Column Settings
  widgetsSelectorRegionId.value = null;
  const newSelectedRegionId =
    regionId === localModel.value.selectedRegionId ? undefined : regionId;
  const isOpening = regionId && newSelectedRegionId;

  let updates = { selectedRegionId: newSelectedRegionId };
  if (isOpening) {
    const hasNestedTables = localModel.value.rows?.some((row) =>
      row.columns?.some((col) => col?.content?.type === "TableLayoutWidget"),
    );
    if (hasNestedTables) {
      updates.rows = localModel.value.rows.map((row) => ({
        ...row,
        columns: (row.columns || []).map((col) => {
          if (
            col?.content?.type === "TableLayoutWidget" &&
            col?.content?.props
          ) {
            return {
              ...col,
              content: {
                ...col.content,
                props: { ...col.content.props, selectedRegionId: undefined },
              },
            };
          }
          return col;
        }),
      }));
    }
  }
  localModel.value = { ...localModel.value, ...updates };
}

function closeRowEditor() {
  localModel.value = {
    ...localModel.value,
    selectedRegionId: undefined,
  };
}

function closeColumnEditor() {
  localModel.value = {
    ...localModel.value,
    selectedRegionId: undefined,
  };
}

function closeWidgetsSelector() {
  widgetsSelectorRegionId.value = null;
  // Call injected closeWidgetsSelector function if available
  if (closeWidgetsSelectorFn) closeWidgetsSelectorFn();
}

function updateColumnValue(rowIndex, colIndex, newValue) {
  const newRows = localModel.value.rows.map((r, i) => {
    if (i !== rowIndex) return r;
    const columns = (r.columns || []).map((c, j) => {
      if (j !== colIndex) return c;
      if (c.kind === "fixed") {
        return { ...c, px: newValue };
      }
      if (c.kind === "percent") {
        return { ...c, percent: newValue };
      }
      return c;
    });
    return { ...r, columns };
  });
  localModel.value = { ...localModel.value, rows: newRows };
}

function updateColumnColspan(rowIndex, colIndex, newColspan) {
  const span = Math.max(1, parseInt(newColspan, 10) || 1);
  const newRows = [...localModel.value.rows];
  const row = newRows[rowIndex];
  if (
    !row.columns ||
    !Array.isArray(row.columns) ||
    colIndex >= row.columns.length
  )
    return;
  row.columns[colIndex] = { ...row.columns[colIndex], colspan: span };
  localModel.value = { ...localModel.value, rows: newRows };
}

function resetColumnWidthPx() {
  const info = selectedColumn.value;
  if (!info || info.columnSpec?.kind !== "fixed") return;
  const val = info.columnValue ?? 200;
  colWidthPxInput.value = val;
  updateColumnValue(info.rowIndex, info.colIndex, val);
}

function resetColumnWidthPct() {
  const info = selectedColumn.value;
  if (!info || info.columnSpec?.kind !== "percent") return;
  const val = info.columnValue ?? 30;
  colWidthPctInput.value = val;
  updateColumnValue(info.rowIndex, info.colIndex, val);
}

function resetColumnColspan() {
  const info = selectedColumn.value;
  if (!info) return;
  const val = info.colspan ?? 1;
  colColspanInput.value = val;
  updateColumnColspan(info.rowIndex, info.colIndex, val);
}

function resetRowHeightPx() {
  const row = selectedRow.value;
  if (!row || row.height?.kind !== "fixed") return;
  const val = row.height.px ?? 100;
  rowHeightPx.value = val;
  updateRowType(selectedRowIndex.value, { kind: "fixed", px: val });
}

function resetRowHeightPct() {
  const row = selectedRow.value;
  if (!row || row.height?.kind !== "percent") return;
  const val = row.height.percent ?? "100%";
  const num = parseFloat(val) || 100;
  rowHeightPercentNum.value = num;
  rowHeightPercent.value = val;
  updateRowType(selectedRowIndex.value, { kind: "percent", percent: val });
}

function removeColumn(rowIndex, colIndex) {
  if (colIndex < 0) return;
  const newRows = localModel.value.rows.map((row) => {
    const cols =
      row.columns && Array.isArray(row.columns) ? [...row.columns] : [];
    if (colIndex < cols.length) cols.splice(colIndex, 1);
    return { ...row, columns: cols.length ? cols : undefined };
  });
  const row = newRows[rowIndex];
  const newColIndex = Math.min(colIndex, (row.columns?.length ?? 1) - 1);
  const selectedRegionId =
    row.columns?.length > 0
      ? getRegionId(row.id, newColIndex >= 0 ? newColIndex : 0)
      : row.id;
  localModel.value = { ...localModel.value, rows: newRows, selectedRegionId };
}

function getDefaultTemplate() {
  return {
    rows: [
      {
        id: generateRowId(),
        height: { kind: "auto" },
        columns: [],
      },
    ],
  };
}

// ============================================================================
// Initialize Default Template if Empty
// ============================================================================

onMounted(() => {
  if (
    !localModel.value ||
    !localModel.value.rows ||
    localModel.value.rows.length === 0
  ) {
    localModel.value = getDefaultTemplate();
  }
});
</script>

<template>
  <div class="w-100 h-100">
    <!-- Preview Canvas -->
    <div class="card w-100" :class="isNestedTable ? 'h-100' : ''">
      <div class="card-body p-0" :class="isNestedTable ? 'h-100' : ''">
        <div
          class="preview-canvas table-canvas"
          :style="previewCanvasStyle"
          @click.stop
        >
          <table :style="tableStyle">
            <colgroup>
              <col
                v-for="(w, colIdx) in tableColumnWidthsArray"
                :key="colIdx"
                :style="{ width: w }"
              />
            </colgroup>
            <tbody>
              <template v-for="(row, rowIndex) in localModel.rows" :key="row.id">
                <tr v-if="row.columns && row.columns.length > 0" :style="getTableRowStyle(row, rowIndex)">
                  <td
                    v-for="(col, colIndex) in row.columns"
                    :key="`${row.id}-${colIndex}`"
                    :colspan="col.colspan ?? 1"
                    :ref="
                      !isNestedTable && col.content?.type === 'TableLayoutWidget'
                        ? (el) => setCellRefForNested(rowIndex, colIndex, el)
                        : undefined
                    "
                    class="grid-cell"
                    :data-row-selected="
                      editMode &&
                      localModel.selectedRegionId === getRegionId(row.id)
                    "
                    :data-cell-selected="
                      editMode &&
                      localModel.selectedRegionId === getRegionId(row.id, colIndex)
                    "
                    :style="getCellStyle(row, colIndex)"
                    @click.stop
                  >
                    <div
                      v-if="editMode && colIndex === 0"
                      class="row-action-buttons"
                      @click.stop
                    >
                      <button
                        type="button"
                        :class="{
                          btn: true,
                          'btn-sm': true,
                          'row-settings-btn': true,
                          'row-settings-btn-selected':
                            localModel.selectedRegionId === getRegionId(row.id),
                        }"
                        title="Row Settings"
                        @click.stop="selectRegion(getRegionId(row.id))"
                      >
                        <i class="fa-solid fa-gear"></i>
                      </button>
                    </div>
                    <div v-if="editMode" class="cell-action-buttons" @click.stop>
                      <div class="btn-group-vertical" role="group" aria-label="">
                        <button
                          type="button"
                          :class="{
                            btn: true,
                            'btn-sm': true,
                            'cell-action-btn': true,
                            'cell-action-btn-selected':
                              editMode &&
                              localModel.selectedRegionId ===
                                getRegionId(row.id, colIndex),
                          }"
                          title="Cell Settings"
                          @click.stop="selectRegion(getRegionId(row.id, colIndex))"
                        >
                          <i class="fa-solid fa-gear"></i>
                        </button>
                        <button
                          type="button"
                          :class="{
                            btn: true,
                            'btn-sm': true,
                            'cell-action-btn': true,
                            'cell-action-btn-selected':
                              editMode &&
                              localModel.selectedRegionId ===
                                getRegionId(row.id, colIndex),
                          }"
                          title="Add Widget"
                          @click.stop="
                            openWidgetsSelectorAndSelectCell(
                              getRegionId(row.id, colIndex),
                            )
                          "
                        >
                          <i class="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    <div class="grid-cell-inner cell-content-wrapper">
                      <small v-if="editMode && !col.content" class="text-muted"
                        >Region {{ rowIndex + 1 }}-{{ colIndex + 1 }}</small
                      >
                      <div
                        v-if="col.content && widgetComponents[col.content.type]"
                        class="cell-widget-preview w-100 h-100 overflow-hidden"
                        :style="getWidgetPreviewWrapperStyle(col)"
                      >
                        <component
                          :is="widgetComponents[col.content.type]"
                          :key="
                            col.content?.type === 'TableLayoutWidget'
                              ? `nested-${rowIndex}-${colIndex}-${getNestedTableRowsKey(col)}`
                              : undefined
                          "
                          v-bind="getWidgetProps(col, row, rowIndex, colIndex)"
                          :style="getWidgetComponentStyle(col)"
                          @update:modelValue="
                            col.content?.type === 'TableLayoutWidget' &&
                            handleNestedTableLayoutUpdate(
                              rowIndex,
                              colIndex,
                              $event,
                            )
                          "
                        />
                      </div>
                      <div
                        v-else-if="col.content"
                        class="cell-invalid-widget py-2"
                      >
                        <span class="small text-muted">{{
                          WIDGET_REGISTRY.find((x) => x.type === col.content?.type)
                            ?.friendlyName ?? col.content?.type
                        }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-else :style="getTableRowStyle(row, rowIndex)">
                  <td
                    :colspan="maxColumns"
                    class="grid-cell grid-cell-empty"
                    :data-row-selected="
                      editMode &&
                      localModel.selectedRegionId === getRegionId(row.id)
                    "
                    :style="getEmptyCellStyle(row)"
                    @click.stop
                  >
                    <div v-if="editMode" class="row-action-buttons" @click.stop>
                      <button
                        type="button"
                        :class="{
                          btn: true,
                          'btn-sm': true,
                          'row-settings-btn': true,
                          'row-settings-btn-selected':
                            localModel.selectedRegionId === getRegionId(row.id),
                        }"
                        title="Row Settings"
                        @click.stop="selectRegion(getRegionId(row.id))"
                      >
                        <i class="fa-solid fa-gear"></i>
                      </button>
                    </div>
                    <div class="row-empty-placeholder w-100">
                      <div class="row-empty-icon-box">
                        <i class="fa-solid fa-border-none fa-4x text-muted"></i>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Row Editor Offcanvas (edit mode only). Teleport to body so it appears above parent table cells when nested. -->
    <Teleport to="body">
      <div
        class="offcanvas offcanvas-end offcanvas-row-editor"
        tabindex="-1"
        :class="{ show: isRowSelected && editMode }"
        :aria-modal="isRowSelected && editMode"
        :aria-labelledby="`row-editor-offcanvas-label-${offcanvasIdPrefix}`"
        :style="
          isRowSelected && editMode
            ? {
                visibility: 'visible',
                zIndex: offcanvasZIndex,
                pointerEvents: 'auto',
              }
            : { visibility: 'hidden', pointerEvents: 'none' }
        "
        data-bs-scroll="true"
        data-bs-backdrop="false"
      >
        <div
          class="offcanvas-header"
          style="position: relative; z-index: 1; pointer-events: auto"
        >
          <h5
            :id="`row-editor-offcanvas-label-${offcanvasIdPrefix}`"
            class="offcanvas-title"
          >
            <i class="fa-solid fa-gear"></i> Settings: Row
            {{ selectedRowIndex >= 0 ? selectedRowIndex + 1 : "" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click.stop="closeRowEditor"
          />
        </div>
        <div class="offcanvas-body">
          <div v-if="selectedRow" class="card">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-start mb-3"
              >
                <div>
                  <strong>Row {{ selectedRowIndex + 1 }}</strong>
                  <div class="small text-muted mt-1">
                    Row Type:
                    <span class="badge bg-secondary">
                      {{
                        selectedRow.height.kind === "fixed"
                          ? "Fixed Width (px)"
                          : selectedRow.height.kind === "percent"
                            ? "Percent (%)"
                            : "Auto"
                      }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Height Controls -->
              <div class="mb-3">
                <label class="form-label d-block mb-2">
                  <strong>Row Type</strong>
                </label>
                <div class="btn-group d-flex" role="group">
                  <input
                    type="radio"
                    class="btn-check"
                    :name="`row-height-${offcanvasIdPrefix}-${selectedRowIndex}`"
                    :id="`offcanvas-height-fixed-${offcanvasIdPrefix}-${selectedRowIndex}`"
                    :checked="selectedRow.height.kind === 'fixed'"
                    @change="
                      updateRowType(selectedRowIndex, {
                        kind: 'fixed',
                        px: 100,
                      })
                    "
                  />
                  <label
                    class="btn btn-outline-secondary btn-sm"
                    :for="`offcanvas-height-fixed-${offcanvasIdPrefix}-${selectedRowIndex}`"
                  >
                    Fixed Width (px)
                  </label>

                  <input
                    type="radio"
                    class="btn-check"
                    :name="`row-height-${offcanvasIdPrefix}-${selectedRowIndex}`"
                    :id="`offcanvas-height-percent-${offcanvasIdPrefix}-${selectedRowIndex}`"
                    :checked="selectedRow.height.kind === 'percent'"
                    @change="
                      updateRowType(selectedRowIndex, {
                        kind: 'percent',
                        percent: '100%',
                      })
                    "
                  />
                  <label
                    class="btn btn-outline-secondary btn-sm"
                    :for="`offcanvas-height-percent-${offcanvasIdPrefix}-${selectedRowIndex}`"
                  >
                    Percentage (%)
                  </label>

                  <input
                    type="radio"
                    class="btn-check"
                    :name="`row-height-${offcanvasIdPrefix}-${selectedRowIndex}`"
                    :id="`offcanvas-height-auto-${offcanvasIdPrefix}-${selectedRowIndex}`"
                    :checked="selectedRow.height.kind === 'auto'"
                    @change="updateRowType(selectedRowIndex, { kind: 'auto' })"
                  />
                  <label
                    class="btn btn-outline-secondary btn-sm"
                    :for="`offcanvas-height-auto-${offcanvasIdPrefix}-${selectedRowIndex}`"
                  >
                  Automatic
                  </label>
                </div>
              </div>

              <div
                v-if="selectedRow.height.kind === 'auto'"
                class="alert alert-info mb-0 mt-3"
              >
                <small>
                  <strong>Auto:</strong> Row height adjusts to fit content. Use
                  for headers, footers, or rows with variable content.
                </small>
              </div>

              <div v-if="selectedRow.height.kind === 'fixed'" class="mb-3">
                <label
                  class="form-label"
                  :for="`row-height-px-${offcanvasIdPrefix}-${selectedRowIndex}`"
                >
                  <strong>Row Height (px)</strong>
                  <small class="text-muted d-block">Fixed pixel height</small>
                </label>
                <div class="d-flex gap-2 align-items-center">
                  <input
                    :id="`row-height-px-${offcanvasIdPrefix}-${selectedRowIndex}`"
                    type="number"
                    class="form-control flex-grow-1"
                    v-model.number="rowHeightPx"
                    min="1"
                    step="10"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    @click="
                      updateRowType(selectedRowIndex, {
                        kind: 'fixed',
                        px: Math.max(1, rowHeightPx ?? 100),
                      })
                    "
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="resetRowHeightPx"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div v-if="selectedRow.height.kind === 'percent'" class="mb-3">
                <label
                  class="form-label"
                  :for="`row-height-percent-${offcanvasIdPrefix}-${selectedRowIndex}`"
                >
                  <strong>Row Height (%)</strong>
                  <small class="text-muted d-block"
                    >Row height as percentage of container. Use for main content
                    areas that should take a specific portion of available
                    space.</small
                  >
                </label>
                <div class="d-flex gap-2 align-items-center">
                  <input
                    :id="`row-height-percent-${offcanvasIdPrefix}-${selectedRowIndex}`"
                    type="number"
                    class="form-control flex-grow-1"
                    v-model.number="rowHeightPercentNum"
                    min="1"
                    max="100"
                    step="10"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    @click="
                      updateRowType(selectedRowIndex, {
                        kind: 'percent',
                        percent:
                          (Math.max(
                            1,
                            Math.min(100, rowHeightPercentNum ?? 100),
                          ) || 100) + '%',
                      })
                    "
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="resetRowHeightPct"
                  >
                    Reset
                  </button>
                </div>
                <small
                  v-if="percentRowCount > 1"
                  class="text-warning d-block mt-1"
                >
                  Warning: Multiple percentage rows may not work as expected.
                  Ensure percentages sum appropriately.
                </small>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-3 pt-3 border-top">
              <h6 class="small mb-2">Quick Actions</h6>
              <div class="d-flex flex-column gap-2">
                <div class="d-flex gap-2 flex-wrap">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    :disabled="selectedRowIndex <= 0"
                    @click="
                      selectRegion(
                        getRegionId(localModel.rows[selectedRowIndex - 1].id),
                      )
                    "
                  >
                    <i class="fa-solid fa-angle-left"></i> Row
                  </button>
                  <button
                    class="btn btn-sm btn-outline-primary"
                    :disabled="!canAddRow"
                    @click="addRowAbove"
                  >
                    <i class="fa-regular fa-square-plus"></i
                    ><i class="fa-solid fa-arrow-up"></i> Row
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    :disabled="!canRemoveRow"
                    @click="removeRow(selectedRowIndex)"
                  >
                    <i class="fa-regular fa-square-minus"></i> Row
                  </button>
                  <button
                    class="btn btn-sm btn-outline-primary"
                    :disabled="!canAddRow"
                    @click="addRowBelow"
                  >
                    <i class="fa-regular fa-square-plus"></i
                    ><i class="fa-solid fa-arrow-down"></i> Row
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    :disabled="
                      selectedRowIndex < 0 ||
                      selectedRowIndex >= localModel.rows.length - 1
                    "
                    @click="
                      selectRegion(
                        getRegionId(localModel.rows[selectedRowIndex + 1].id),
                      )
                    "
                  >
                    <i class="fa-solid fa-angle-right"></i> Row
                  </button>
                </div>
                <button
                  v-if="
                    !selectedRow.columns || selectedRow.columns.length === 0
                  "
                  class="btn btn-sm btn-outline-primary w-100"
                  @click="addColumn"
                >
                  <i class="fa-regular fa-square-plus"></i> Add Column
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Column Editor Offcanvas (shows when cog/settings icon clicked in edit mode). Teleport to body so it appears above parent table cells when nested. -->
    <Teleport to="body">
      <div
        class="offcanvas offcanvas-end offcanvas-column-editor"
        tabindex="-1"
        :class="{ show: isColumnSelected && editMode }"
        :aria-modal="isColumnSelected && editMode"
        :aria-labelledby="`column-editor-offcanvas-label-${offcanvasIdPrefix}`"
        :style="
          isColumnSelected && editMode
            ? {
                visibility: 'visible',
                zIndex: offcanvasZIndex,
                pointerEvents: 'auto',
              }
            : { visibility: 'hidden', pointerEvents: 'none' }
        "
        data-bs-scroll="true"
        data-bs-backdrop="false"
      >
        <div
          class="offcanvas-header"
          style="position: relative; z-index: 1; pointer-events: auto"
        >
          <h5
            :id="`column-editor-offcanvas-label-${offcanvasIdPrefix}`"
            class="offcanvas-title"
          >
            <i class="fa-solid fa-gear"></i> Settings:
            {{
              selectedColumn
                ? `Column ${selectedColumn.colIndex + 1} - Row ${selectedColumn.rowIndex + 1}`
                : ""
            }}
          </h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click.stop="closeColumnEditor"
          />
        </div>
        <div class="offcanvas-body">
          <div v-if="selectedColumn" class="card">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-start mb-3"
              >
                <div>
                  <strong
                    >Column {{ selectedColumn.colIndex + 1 }} - Row
                    {{ selectedColumn.rowIndex + 1 }}</strong
                  >
                  <div class="small text-muted mt-1">
                    Column Type:
                    <span class="badge bg-secondary">
                      {{
                        selectedColumn.columnSpec.kind === "fixed"
                          ? "Fixed Width (px)"
                          : selectedColumn.columnSpec.kind === "percent"
                            ? "Percent (%)"
                            : "Auto"
                      }}
                    </span>
                  </div>
                </div>
                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="selectRegion(getRegionId(selectedColumn.row.id))"
                >
                  Edit Row
                </button>
              </div>

              <!-- Column Type Selector -->
              <div class="mb-3">
                <label class="form-label d-block mb-2">
                  <strong>Column Type</strong>
                </label>
                <div class="btn-group d-flex" role="group">
                  <input
                    type="radio"
                    class="btn-check"
                    :name="`col-kind-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                    :id="`col-editor-fixed-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                    :checked="selectedColumn.columnSpec.kind === 'fixed'"
                    @change="
                      updateColumnType(
                        selectedColumn.rowIndex,
                        selectedColumn.colIndex,
                        'fixed',
                        200,
                      )
                    "
                  />
                  <label
                    class="btn btn-outline-secondary btn-sm"
                    :for="`col-editor-fixed-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                  >
                    Fixed Width (px)
                  </label>
                  <input
                    type="radio"
                    class="btn-check"
                    :name="`col-kind-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                    :id="`col-editor-percent-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                    :checked="selectedColumn.columnSpec.kind === 'percent'"
                    @change="
                      updateColumnType(
                        selectedColumn.rowIndex,
                        selectedColumn.colIndex,
                        'percent',
                        30,
                      )
                    "
                  />
                  <label
                    class="btn btn-outline-secondary btn-sm"
                    :for="`col-editor-percent-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                  >
                    Percentage (%)
                  </label>
                  <input
                    type="radio"
                    class="btn-check"
                    :name="`col-kind-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                    :id="`col-editor-auto-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                    :checked="selectedColumn.columnSpec.kind === 'auto'"
                    @change="
                      updateColumnType(
                        selectedColumn.rowIndex,
                        selectedColumn.colIndex,
                        'auto',
                      )
                    "
                  />
                  <label
                    class="btn btn-outline-secondary btn-sm"
                    :for="`col-editor-auto-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                  >
                    Automatic
                  </label>
                </div>
              </div>

              <div
                v-if="selectedColumn.columnSpec.kind === 'fixed'"
                class="mb-3"
              >
                <label
                  class="form-label"
                  :for="`col-width-px-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                >
                  <strong>Column Width (px)</strong>
                  <small class="text-muted d-block">Fixed pixel width</small>
                </label>
                <div class="d-flex gap-2 align-items-center">
                  <input
                    :id="`col-width-px-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                    type="number"
                    class="form-control flex-grow-1"
                    v-model.number="colWidthPxInput"
                    min="1"
                    step="10"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    @click="
                      updateColumnValue(
                        selectedColumn.rowIndex,
                        selectedColumn.colIndex,
                        Math.max(1, colWidthPxInput ?? 200),
                      )
                    "
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="resetColumnWidthPx"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div
                v-if="selectedColumn.columnSpec.kind === 'percent'"
                class="mb-3"
              >
                <label
                  class="form-label"
                  :for="`col-width-pct-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                >
                  <strong>Column Width (%)</strong>
                  <small class="text-muted d-block"
                    >Percentage of remaining width after fixed columns</small
                  >
                </label>
                <div class="d-flex gap-2 align-items-center">
                  <input
                    :id="`col-width-pct-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                    type="number"
                    class="form-control flex-grow-1"
                    v-model.number="colWidthPctInput"
                    min="1"
                    max="100"
                    step="10"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    @click="
                      updateColumnValue(  
                        selectedColumn.rowIndex,
                        selectedColumn.colIndex,
                        Math.max(1, Math.min(100, colWidthPctInput ?? 30)),
                      )
                    "
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="resetColumnWidthPct"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div
                v-if="selectedColumn.columnSpec.kind === 'auto'"
                class="alert alert-info mb-0"
              >
                <small>
                  <strong>Auto:</strong> Column width adjusts automatically to
                  fit content and takes all remaining space.
                </small>
              </div>

              <!-- Cell Colspan -->
              <div class="mb-3">
                <label
                  class="form-label"
                  :for="`col-colspan-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                >
                  <strong>Cell Colspan</strong>
                  <small class="text-muted d-block"
                    >Number of columns this cell spans</small
                  >
                </label>
                <div class="d-flex gap-2 align-items-center">
                  <input
                    :id="`col-colspan-${offcanvasIdPrefix}-${selectedColumn.rowIndex}-${selectedColumn.colIndex}`"
                    type="number"
                    class="form-control flex-grow-1"
                    v-model.number="colColspanInput"
                    :min="1"
                    :max="selectedColumn.maxColspan"
                    step="1"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    @click="
                      updateColumnColspan(
                        selectedColumn.rowIndex,
                        selectedColumn.colIndex,
                        Math.max(
                          1,
                          Math.min(
                            selectedColumn.maxColspan,
                            colColspanInput ?? 1,
                          ),
                        ),
                      )
                    "
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="resetColumnColspan"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="mt-3 pt-3 border-top">
                <h6 class="small mb-2">Quick Actions</h6>
                <div class="d-flex flex-column gap-2">
                  <div class="d-flex gap-2 flex-wrap">
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      :disabled="selectedColumn.colIndex <= 0"
                      @click="
                        selectRegion(
                          getRegionId(
                            selectedColumn.row.id,
                            selectedColumn.colIndex - 1,
                          ),
                        )
                      "
                    >
                      <i class="fa-solid fa-angle-left"></i> Column
                    </button>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="addColumn"
                      :disabled="!hasSelectedRow"
                    >
                      <i class="fa-regular fa-square-plus"></i> Column
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      :disabled="
                        !selectedColumn ||
                        !selectedColumn.allColumns ||
                        selectedColumn.allColumns.length <= 1
                      "
                      @click="
                        removeColumn(
                          selectedColumn.rowIndex,
                          selectedColumn.colIndex,
                        )
                      "
                    >
                      <i class="fa-regular fa-square-minus"></i> Column
                    </button>
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      :disabled="
                        !selectedColumn.allColumns ||
                        selectedColumn.colIndex >=
                          selectedColumn.allColumns.length - 1
                      "
                      @click="
                        selectRegion(
                          getRegionId(
                            selectedColumn.row.id,
                            selectedColumn.colIndex + 1,
                          ),
                        )
                      "
                    >
                      Column <i class="fa-solid fa-angle-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dashboard-layout-editor {
  width: 100%;
  padding: 1rem;
}

.preview-canvas.table-canvas {
  width: 100%;
  min-height: 400px;
}

.preview-canvas.table-canvas table {
  border-collapse: collapse;
  border-spacing: 0;
}

.grid-cell {
  min-height: 0;
  min-width: 0;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  z-index: 1;
  position: relative;
  overflow: hidden;
  vertical-align: top;
}

.grid-cell-inner {
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.row-empty-placeholder {
  min-height: 80px;
  padding: 1rem;
  text-align: center;
  cursor: default;
}

.row-empty-icon-box {
  border: 2px dashed #adb5bd;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
  min-height: 4rem;
  cursor: pointer;
  display: inline-block;
}

.row-empty-icon-box i,
.row-empty-icon-box :deep(i),
.row-empty-icon-box :deep(svg) {
  display: block;
  margin: auto;
  line-height: 1;
}

.cell-content-wrapper {
  width: 100%;
  height: 100%;
  min-height: 0;
  cursor: default;
  overflow: hidden;
}

.cell-invalid-widget {
  text-align: center;
  width: 100%;
}

.cell-widget-preview {
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.cell-widget-preview > * {
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
}

/* Row action buttons - top-left of first cell */
.grid-cell .row-action-buttons {
  position: absolute;
  top: -2px;
  left: -4px;
  z-index: 10;
  pointer-events: auto;
}

.grid-cell {
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

/* Cell action buttons - positioned top right */
.cell-action-buttons {
  position: absolute;
  top: -2px;
  right: -3px;
  z-index: 10;
  pointer-events: auto;
}

/* Row settings button colors */
.grid-cell .row-settings-btn {
  background-color: #dee2e6;
  border-color: #dee2e6;
  color: #6c757d;
}

.grid-cell .row-settings-btn:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.grid-cell .row-settings-btn-selected {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
}

.grid-cell .row-settings-btn-selected:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
}

/* Cell action buttons colors */
.cell-action-buttons .cell-action-btn {
  background-color: #adb5bd;
  border-color: #adb5bd;
  color: #6c757d;
}

.cell-action-buttons .cell-action-btn:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

/* Apply hover color when cell is hovered (but not if button is selected) */
.grid-cell:hover
  .cell-action-buttons
  .cell-action-btn:not(.cell-action-btn-selected) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.cell-action-buttons .cell-action-btn-selected {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

.cell-action-buttons .cell-action-btn-selected:hover {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

/* Keep blue color when cell is hovered and button is selected */
.grid-cell:hover .cell-action-buttons .cell-action-btn-selected {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

/* Hover state: darker border color for unselected cells */
.grid-cell:hover {
  border-color: #6c757d !important;
}

/* Hover state for selected cells: maintain selection color */
.grid-cell[data-cell-selected="true"]:hover {
  border-color: #0d6efd !important;
}

/* Hover state for selected rows: maintain selection color */
.grid-cell[data-row-selected="true"]:hover {
  border-color: #dc3545 !important;
}

.card-body .card {
  border: 1px solid #dee2e6;
}

.widget-selector-item {
  cursor: pointer;
}
.widget-selector-item:hover {
  background-color: var(--bs-tertiary-bg);
}

.offcanvas-column-editor {
  width: 460px;
  max-width: 90vw;
}

/* Ensure all offcanvases appear above grid overlays and buttons (high z-index for nested tables) */
.offcanvas-row-editor,
.offcanvas-column-editor {
  z-index: 9999 !important;
  pointer-events: auto;
}

.offcanvas-row-editor {
  width: 460px;
  max-width: 90vw;
}

.btn-group .btn-check:checked + .btn {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.btn-group .btn-check:disabled + .btn,
.btn-group .btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
