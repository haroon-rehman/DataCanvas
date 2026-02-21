<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { widgetMeta as iconValueWidgetMeta } from "../widgets/IconValueWidget.vue";
import { widgetMeta as valueWidgetMeta } from "../widgets/ValueWidget.vue";
import { widgetMeta as gridstackWidgetMeta } from "../widgets/GridstackWidget.vue";

// Registry of widgets for the selector: { type, friendlyName, description, icon, group }
const WIDGET_REGISTRY = [
  { type: "IconValueWidget", ...iconValueWidgetMeta },
  { type: "GridstackWidget", ...gridstackWidgetMeta },
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
  gridOptions: { type: Object, default: () => ({ column: 3, cellHeight: "70px", cellWidth: "120px", margin: 5 }) },
  /** Components allowed inside GridLayoutWidget (e.g. { IconValueWidget }). If omitted, widgetComponents is used. */
  contentWidgetComponents: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue"]);

/** Resolve content widget map for nested GridLayoutWidget (exclude layout widgets if needed). */
const resolvedContentWidgetComponents = computed(() =>
  props.contentWidgetComponents != null ? props.contentWidgetComponents : props.widgetComponents
);

/** Props to pass when rendering a widget in a cell (preview mode). */
function getWidgetProps(col, row, rowIndex, colIndex) {
  const type = col.content?.type;
  const cellProps = col.content?.props ?? {};
  if (type === "GridstackWidget") {
    return {
      widgets: cellProps.widgets ?? [],
      updateWidget: () => {},
      gridOptions: props.gridOptions,
      widgetComponents: resolvedContentWidgetComponents.value,
      gridDefaultsByType: props.gridDefaultsByType,
      sizeMode: "auto",
      backgroundColor: cellProps.backgroundColor ?? "",
      foregroundColor: cellProps.foregroundColor ?? "",
      editMode: editMode.value,
    };
  }
  return cellProps;
}

const route = useRoute();

// ============================================================================
// State
// ============================================================================

// edit=1 in URL query → edit mode; otherwise preview mode
const editMode = computed(() => route.query.edit === "1");

// Widgets Selector opens only when plus icon is clicked (not cog/settings)
const widgetsSelectorRegionId = ref(null);

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
        // Use calc to get percentage of remaining space after fixed px rows
        // calc((100vh - fixedPxTotal) * normalizedPercent / 100)
        return `calc((100vh - ${fixedPxTotal}px) * ${normalizedPercent} / 100)`;
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

const selectedColumnIndex = computed(() => {
  return getSelectedColumnIndex();
});

const isColumnSelected = computed(() => {
  if (!localModel.value.selectedRegionId) return false;
  // Check if selectedRegionId is a column region (format: rowId-col-X)
  return /^.+-col-\d+$/.test(localModel.value.selectedRegionId);
});

const selectedColumnInfo = computed(() => {
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
  return {
    rowIndex,
    colIndex,
    row,
    columnSpec,
    columnValue,
    allColumns: row.columns,
  };
});

const widgetsSelectorColumnInfo = computed(() => {
  return getColumnInfoFromRegionId(widgetsSelectorRegionId.value);
});

const previewCanvasStyle = computed(() => ({
  height: "100vh",
  display: "grid",
  gridTemplateRows: gridTemplateRows.value,
  border: "1px solid #dee2e6",
  backgroundColor: "#f8f9fa",
  position: "relative",
  overflow: "auto",
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
// ROWS (getRowStyle)
// ============================================================================
//   Property          | Edit Mode                    | Preview Mode
//   ------------------|------------------------------|------------------
//   border            | 4px dashed #dee2e6          | none
//   backgroundColor   | transparent                  | transparent
//   gap (between cells)| 0                            | 4px
//   padding           | 8px                         | 8px
//   cursor            | pointer                      | pointer
//
// Row Selection (when selectedRegionId === row.id):
//   Property          | Edit Mode                    | Preview Mode
//   ------------------|------------------------------|------------------
//   border            | 4px solid #dc3545 (red)      | (no selection)
//   borderColor       | #dc3545                      | (no selection)
//   boxShadow         | 0 0 0 0.2rem rgba(220, 53, 69, 0.25) | (no selection)
//   CSS class         | row-selected                  | (no class)
//   Hover override    | Red border maintained        | (no selection)
//
// ============================================================================
// CELLS (getCellStyle)
// ============================================================================
//   Property          | Edit Mode                    | Preview Mode
//   ------------------|------------------------------|------------------
//   border            | 2px dashed #adb5bd         | none
//   backgroundColor   | transparent                  | transparent
//   padding           | 4px                         | 4px
//
// Cell Selection (when selectedRegionId === rowId-col-N):
//   Property          | Edit Mode                    | Preview Mode
//   ------------------|------------------------------|------------------
//   border            | 2px solid #0d6efd (blue)      | (no selection)
//   boxShadow         | 0 0 0 0.2rem rgba(13, 110, 253, 0.25) | (no selection)
//   CSS class         | cell-selected                 | (no class)
//   Hover override    | Blue border maintained        | (no selection)
//
// ============================================================================
// UI ELEMENTS VISIBILITY
// ============================================================================
//   Element           | Edit Mode                    | Preview Mode
//   ------------------|------------------------------|------------------
//   Region labels     | Visible ("Region X-Y")       | Hidden
//   Empty cell placeholder| Visible (with pen icon)   | Hidden
//   Pen icon (fa-pen-to-square)| Visible on empty cells | Hidden
//   Row Settings panel| Visible when row selected     | Hidden
//   Column Settings panel| Visible when cell selected | Hidden
//   Widget Selector   | Visible                      | Hidden
//
// ============================================================================
// CELL CONTENT DISPLAY
// ============================================================================
//   Cell State        | Edit Mode                    | Preview Mode
//   ------------------|------------------------------|------------------
//   Empty cell        | Shows placeholder + pen icon | (empty, no content)
//   Cell with widget  | Shows widget component        | Shows widget component
//   Cell with invalid widget| Shows widget type name  | Shows widget type name
//
// ============================================================================
// INTERACTIONS
// ============================================================================
//   Action            | Edit Mode                    | Preview Mode
//   ------------------|------------------------------|------------------
//   Row click         | Selects row (red border)     | No selection
//   Cell click        | Selects cell (blue border)  | No selection
//   Row hover         | Border: #adb5bd (gray)       | Border: #adb5bd (gray)
//   Selected row hover| Border: #dc3545 (red)       | (no selection)
//   Selected cell hover| Border: #0d6efd (blue)      | (no selection)
//   Empty cell click  | Opens Widget Selector        | No action
//   Widget click      | Opens Property Grid          | No action
//
// ============================================================================
// CSS HOVER BEHAVIOR
// ============================================================================
//   State             | Border Color                 | Notes
//   ------------------|------------------------------|------------------
//   Default hover     | #adb5bd (gray)               | Applies to both modes
//   Selected row hover| #dc3545 (red) !important    | Overrides default hover
//   Selected cell hover| #0d6efd (blue) !important  | Overrides default hover
//
// ============================================================================
// ACTIVATION
// ============================================================================
//   Mode              | Trigger                     | URL Query Param
//   ------------------|------------------------------|------------------
//   Edit Mode         | editMode = true              | ?edit=1
//   Preview Mode      | editMode = false             | ?edit=0 or omitted

function getRowStyle(row) {
  const style = {
    border: editMode.value ? "4px dashed #dee2e6" : "none",
    padding: "8px",
    backgroundColor: "transparent",
    minHeight: "0",
    position: editMode.value ? "relative" : "static",
  };

  if (row.columns && Array.isArray(row.columns) && row.columns.length > 0) {
    style.display = "grid";
    style.gridTemplateColumns = getColumnTemplate(row.columns);
    style.gap = editMode.value ? "0" : "4px";
  } else {
    style.display = "flex";
    style.alignItems = "center";
    style.justifyContent = "center";
  }

  const regionId = getRegionId(row.id);
  if (editMode.value && localModel.value.selectedRegionId === regionId) {
    style.border = "4px solid #dc3545";
    style.borderColor = "#dc3545";
    style.boxShadow = "0 0 0 0.2rem rgba(220, 53, 69, 0.25)";
  }

  return style;
}

function getCellStyle(row, colIndex) {
  const style = {
    border: editMode.value ? "2px dashed #adb5bd" : "none",
    padding: "4px",
    backgroundColor: "transparent",
    minHeight: "0",
    position: editMode.value ? "relative" : "static",
  };
  const regionId = getRegionId(row.id, colIndex);
  if (editMode.value && localModel.value.selectedRegionId === regionId) {
    style.border = "2px solid #0d6efd";
    style.boxShadow = "0 0 0 0.2rem rgba(13, 110, 253, 0.25)";
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
  return {
    rowIndex,
    colIndex,
    row,
    columnSpec,
    columnValue,
    allColumns: row.columns,
  };
}

/** Default props when adding a widget to a region (by type). */
function getDefaultPropsForWidgetType(type) {
  switch (type) {
    case "IconValueWidget":
      return { value: "--", label: "", icon: "fa-chart-simple", iconColor: "steelblue" };
    case "GridstackWidget":
      return { widgets: [] };
    default:
      return {};
  }
}

function addWidgetToSelectedRegion(widgetType) {
  const info = getColumnInfoFromRegionId(widgetsSelectorRegionId.value);
  if (!info) return;
  const { rowIndex, colIndex, row, columnSpec, allColumns } = info;
  const newColumns = allColumns.map((col, i) =>
    i === colIndex
      ? { ...col, content: { type: widgetType, props: getDefaultPropsForWidgetType(widgetType) } }
      : { ...col }
  );
  const newRows = localModel.value.rows.map((r, i) =>
    i === rowIndex ? { ...r, columns: newColumns } : { ...r }
  );
  localModel.value = { ...localModel.value, rows: newRows };
  closeWidgetsSelector();
}

function openWidgetsSelector(regionId) {
  widgetsSelectorRegionId.value = regionId;
  // Close Column Settings offcanvas
  localModel.value = {
    ...localModel.value,
    selectedRegionId: undefined,
  };
}

function openWidgetsSelectorAndSelectCell(regionId) {
  // Select the cell first
  localModel.value = {
    ...localModel.value,
    selectedRegionId: regionId,
  };
  // Then open the widget selector
  widgetsSelectorRegionId.value = regionId;
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
      ? row.columns.map((col) => ({ ...col }))
      : [{ kind: "auto" }, { kind: "auto" }, { kind: "auto" }];
  const newRow = {
    id: generateRowId(),
    height: { kind: "auto" },
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
      ? row.columns.map((col) => ({ ...col }))
      : [{ kind: "auto" }, { kind: "auto" }, { kind: "auto" }];
  const newRow = {
    id: generateRowId(),
    height: { kind: "auto" },
    columns: columnSpecs,
  };
  const newRows = [...localModel.value.rows];
  newRows.splice(selectedRowIndex.value + 1, 0, newRow);
  localModel.value = { ...localModel.value, rows: newRows };
}

function addColumn() {
  const selectedRowIndex = getSelectedRowIndex();
  if (selectedRowIndex < 0) return;

  const newRows = [...localModel.value.rows];
  const row = newRows[selectedRowIndex];

  if (!row.columns || !Array.isArray(row.columns) || row.columns.length === 0) {
    row.columns = [{ kind: "auto" }];
    localModel.value = {
      ...localModel.value,
      rows: newRows,
      selectedRegionId: getRegionId(row.id, 0),
    };
    return;
  }
  const selectedColIndex = getSelectedColumnIndex();
  const newColumn = { kind: "auto" };
  let insertIndex;
  if (selectedColIndex >= 0 && selectedColIndex < row.columns.length) {
    row.columns.splice(selectedColIndex + 1, 0, newColumn);
    insertIndex = selectedColIndex + 1;
  } else {
    row.columns.push(newColumn);
    insertIndex = row.columns.length - 1;
  }
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

function updateRowHeight(index, height) {
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
  const newRows = [...localModel.value.rows];
  const row = newRows[rowIndex];
  if (
    !row.columns ||
    !Array.isArray(row.columns) ||
    colIndex >= row.columns.length
  )
    return;
  const newColumnSpec = { kind: newType };
  if (newType === "fixed") {
    newColumnSpec.px = defaultValue !== undefined ? defaultValue : 200;
  } else if (newType === "percent") {
    newColumnSpec.percent = defaultValue !== undefined ? defaultValue : 30;
  }
  row.columns[colIndex] = newColumnSpec;
  localModel.value = { ...localModel.value, rows: newRows };
}

function selectRegion(regionId) {
  // Close Widgets Selector offcanvas when opening Row or Column Settings
  widgetsSelectorRegionId.value = null;
  localModel.value = {
    ...localModel.value,
    selectedRegionId:
      regionId === localModel.value.selectedRegionId ? undefined : regionId,
  };
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
}

function updateColumnValue(rowIndex, colIndex, newValue) {
  const newRows = [...localModel.value.rows];
  const row = newRows[rowIndex];
  if (
    !row.columns ||
    !Array.isArray(row.columns) ||
    colIndex >= row.columns.length
  )
    return;
  const columnSpec = row.columns[colIndex];
  if (columnSpec.kind === "fixed") {
    columnSpec.px = newValue;
  } else if (columnSpec.kind === "percent") {
    columnSpec.percent = newValue;
  }
  localModel.value = { ...localModel.value, rows: newRows };
}

function removeColumn(rowIndex, colIndex) {
  const newRows = [...localModel.value.rows];
  const row = newRows[rowIndex];
  if (!row.columns || !Array.isArray(row.columns) || row.columns.length === 0)
    return;
  if (colIndex >= 0 && colIndex < row.columns.length) {
    row.columns.splice(colIndex, 1);
  }
  const newColIndex = Math.min(colIndex, row.columns.length - 1);
  const selectedRegionId =
    row.columns.length > 0
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
        columns: [{ kind: "auto" }, { kind: "auto" }, { kind: "auto" }],
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
  <div class="dashboard-layout-editor">
    <!-- Preview Canvas -->
    <div class="card w-100">
      <div class="card-body p-0">
        <div class="preview-canvas" :style="previewCanvasStyle" @click.stop>
          <div
            v-for="(row, rowIndex) in localModel.rows"
            :key="row.id"
            :class="{ 'row-selected': editMode && localModel.selectedRegionId === getRegionId(row.id) }"
            :style="getRowStyle(row)"
            @click.stop="selectRegion(getRegionId(row.id))"
          >
            <!-- Row Action Buttons (Edit Mode Only) -->
            <div
              v-if="editMode"
              class="row-action-buttons"
              @click.stop
            >
              <button
                type="button"
                :class="{
                  'btn': true,
                  'btn-sm': true,
                  'row-settings-btn': true,
                  'row-settings-btn-selected': editMode && localModel.selectedRegionId === getRegionId(row.id)
                }"
                title="Row Settings"
                @click.stop="selectRegion(getRegionId(row.id))"
              >
                <i class="fa-solid fa-gear"></i>
              </button>
            </div>
            <template
              v-if="
                row.columns &&
                Array.isArray(row.columns) &&
                row.columns.length > 0
              "
            >
              <div
                v-for="(col, colIndex) in row.columns"
                :key="colIndex"
                :class="{ 'cell-selected': editMode && localModel.selectedRegionId === getRegionId(row.id, colIndex) }"
                :style="getCellStyle(row, colIndex)"
                @click.stop
              >
                <!-- Cell Action Buttons (Edit Mode Only) -->
                <div
                  v-if="editMode"
                  class="cell-action-buttons"
                  @click.stop
                >
                  <div class="btn-group-vertical" role="group" aria-label="">                  
                    <button
                      type="button"
                      :class="{
                        'btn': true,
                        'btn-sm': true,
                        'cell-action-btn': true,
                        'cell-action-btn-selected': editMode && localModel.selectedRegionId === getRegionId(row.id, colIndex)
                      }"
                      title="Cell Settings"
                      @click.stop="selectRegion(getRegionId(row.id, colIndex))"
                    >
                      <i class="fa-solid fa-gear"></i>
                    </button>
                    <button
                      type="button"
                      :class="{
                        'btn': true,
                        'btn-sm': true,
                        'cell-action-btn': true,
                        'cell-action-btn-selected': editMode && localModel.selectedRegionId === getRegionId(row.id, colIndex)
                      }"
                      title="Add Widget"
                      @click.stop="openWidgetsSelectorAndSelectCell(getRegionId(row.id, colIndex))"
                    >
                      <i class="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>
                <div class="cell-content-wrapper">
                  <small v-if="editMode && !col.content" class="text-muted"
                    >Region {{ rowIndex + 1 }}-{{ colIndex + 1 }}</small
                  >
                  <div
                    v-if="col.content && widgetComponents[col.content.type]"
                    class="cell-widget-preview w-100 h-100 d-flex align-items-stretch justify-content-stretch overflow-hidden"
                  >
                    <component
                      :is="widgetComponents[col.content.type]"
                      v-bind="getWidgetProps(col, row, rowIndex, colIndex)"
                    />
                  </div>
                  <div
                    v-else-if="col.content"
                    class="d-flex align-items-center justify-content-center w-100 py-2"
                  >
                    <span class="small text-muted">{{
                      WIDGET_REGISTRY.find((x) => x.type === col.content?.type)?.friendlyName ?? col.content?.type
                    }}</span>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div
                class="row-empty-placeholder d-flex align-items-center justify-content-center w-100"
              >
                <div
                  class="row-empty-icon-box d-flex align-items-center justify-content-center"
                >
                  <i class="fa-solid fa-border-none fa-4x text-muted"></i>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Row Editor Offcanvas (edit mode only) -->
    <div
      class="offcanvas offcanvas-end offcanvas-row-editor"
      tabindex="-1"
      :class="{ show: isRowSelected && editMode }"
      :aria-modal="isRowSelected && editMode"
      aria-labelledby="row-editor-offcanvas-label"
      :style="isRowSelected && editMode ? { visibility: 'visible' } : {}"
      data-bs-scroll="true"
      data-bs-backdrop="false"
    >
      <div class="offcanvas-header">
        <h5 id="row-editor-offcanvas-label" class="offcanvas-title">
          <i class="fa-solid fa-gear"></i> Settings: Row
          {{ selectedRowIndex >= 0 ? selectedRowIndex + 1 : "" }}
        </h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="closeRowEditor"
        />
      </div>
      <div class="offcanvas-body">
        <div v-if="selectedRow" class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <strong>Row {{ selectedRowIndex + 1 }}</strong>
            </div>

            <!-- Height Controls -->
            <div class="mb-2">
              <label class="form-label small d-block mb-2">Height</label>
              <div class="btn-group" role="group">
                <input
                  type="radio"
                  class="btn-check"
                  :id="`offcanvas-height-fixed-${selectedRowIndex}`"
                  :checked="selectedRow.height.kind === 'fixed'"
                  @change="
                    updateRowHeight(selectedRowIndex, {
                      kind: 'fixed',
                      px: 100,
                    })
                  "
                />
                <label
                  class="btn btn-outline-secondary btn-sm"
                  :for="`offcanvas-height-fixed-${selectedRowIndex}`"
                >
                  Fixed (px)
                </label>

                <input
                  type="radio"
                  class="btn-check"
                  :id="`offcanvas-height-percent-${selectedRowIndex}`"
                  :checked="selectedRow.height.kind === 'percent'"
                  @change="
                    updateRowHeight(selectedRowIndex, {
                      kind: 'percent',
                      percent: '100%',
                    })
                  "
                />
                <label
                  class="btn btn-outline-secondary btn-sm"
                  :for="`offcanvas-height-percent-${selectedRowIndex}`"
                >
                  Percent (%)
                </label>

                <input
                  type="radio"
                  class="btn-check"
                  :id="`offcanvas-height-auto-${selectedRowIndex}`"
                  :checked="selectedRow.height.kind === 'auto'"
                  @change="updateRowHeight(selectedRowIndex, { kind: 'auto' })"
                />
                <label
                  class="btn btn-outline-secondary btn-sm"
                  :for="`offcanvas-height-auto-${selectedRowIndex}`"
                >
                  Auto
                </label>
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

              <div v-if="selectedRow.height.kind === 'fixed'" class="mt-2">
                <input
                  type="number"
                  class="form-control form-control-sm"
                  :value="selectedRow.height.px"
                  min="1"
                  @input="
                    (e) =>
                      updateRowHeight(selectedRowIndex, {
                        kind: 'fixed',
                        px: Math.max(1, parseInt(e.target.value) || 100),
                      })
                  "
                />
                <small class="text-muted">px</small>
              </div>

              <div v-if="selectedRow.height.kind === 'percent'" class="mt-2">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :value="selectedRow.height.percent"
                  placeholder="100%"
                  @input="
                    (e) =>
                      updateRowHeight(selectedRowIndex, {
                        kind: 'percent',
                        percent: e.target.value.trim() || '100%',
                      })
                  "
                />
                <small class="text-muted">%</small>
                <small class="text-muted d-block mt-1">
                  <strong>Percent (%):</strong> Row height as percentage of
                  container. Use for main content areas that should take a
                  specific portion of available space.
                </small>
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
    </div>

    <!-- Column Editor Offcanvas (shows when cog/settings icon clicked in edit mode) -->
    <div
      class="offcanvas offcanvas-end offcanvas-column-editor"
      tabindex="-1"
      :class="{ show: isColumnSelected && editMode }"
      :aria-modal="isColumnSelected && editMode"
      aria-labelledby="column-editor-offcanvas-label"
      :style="isColumnSelected && editMode ? { visibility: 'visible' } : {}"
      data-bs-scroll="true"
      data-bs-backdrop="false"
    >
      <div class="offcanvas-header">
        <h5 id="column-editor-offcanvas-label" class="offcanvas-title">
          <i class="fa-solid fa-gear"></i> Settings:
          {{
            selectedColumnInfo
              ? `Column ${selectedColumnInfo.colIndex + 1} - Row ${selectedColumnInfo.rowIndex + 1}`
              : ""
          }}
        </h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="closeColumnEditor"
        />
      </div>
      <div class="offcanvas-body">
        <div v-if="selectedColumnInfo" class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <strong
                  >Column {{ selectedColumnInfo.colIndex + 1 }} - Row
                  {{ selectedColumnInfo.rowIndex + 1 }}</strong
                >
                <div class="small text-muted mt-1">
                  Column Type:
                  <span class="badge bg-secondary">
                    {{
                      selectedColumnInfo.columnSpec.kind === "fixed"
                        ? "Fixed Width (px)"
                        : selectedColumnInfo.columnSpec.kind === "percent"
                          ? "Percent (%)"
                          : "Auto"
                    }}
                  </span>
                </div>
              </div>
              <button
                class="btn btn-sm btn-outline-primary"
                @click="selectRegion(getRegionId(selectedColumnInfo.row.id))"
              >
                Edit Row
              </button>
            </div>

            <!-- Column Type Selector -->
            <div class="mb-3">
              <label class="form-label d-block mb-2">
                <strong>Column Type</strong>
              </label>
              <div class="btn-group" role="group">
                <input
                  type="radio"
                  class="btn-check"
                  :id="`col-editor-fixed-${selectedColumnInfo.rowIndex}-${selectedColumnInfo.colIndex}`"
                  :checked="selectedColumnInfo.columnSpec.kind === 'fixed'"
                  @change="
                    updateColumnType(
                      selectedColumnInfo.rowIndex,
                      selectedColumnInfo.colIndex,
                      'fixed',
                      200,
                    )
                  "
                />
                <label
                  class="btn btn-outline-secondary btn-sm"
                  :for="`col-editor-fixed-${selectedColumnInfo.rowIndex}-${selectedColumnInfo.colIndex}`"
                >
                  Fixed Width (px)
                </label>
                <input
                  type="radio"
                  class="btn-check"
                  :id="`col-editor-percent-${selectedColumnInfo.rowIndex}-${selectedColumnInfo.colIndex}`"
                  :checked="selectedColumnInfo.columnSpec.kind === 'percent'"
                  @change="
                    updateColumnType(
                      selectedColumnInfo.rowIndex,
                      selectedColumnInfo.colIndex,
                      'percent',
                      30,
                    )
                  "
                />
                <label
                  class="btn btn-outline-secondary btn-sm"
                  :for="`col-editor-percent-${selectedColumnInfo.rowIndex}-${selectedColumnInfo.colIndex}`"
                >
                  Percent (%)
                </label>
                <input
                  type="radio"
                  class="btn-check"
                  :id="`col-editor-auto-${selectedColumnInfo.rowIndex}-${selectedColumnInfo.colIndex}`"
                  :checked="selectedColumnInfo.columnSpec.kind === 'auto'"
                  @change="
                    updateColumnType(
                      selectedColumnInfo.rowIndex,
                      selectedColumnInfo.colIndex,
                      'auto',
                    )
                  "
                />
                <label
                  class="btn btn-outline-secondary btn-sm"
                  :for="`col-editor-auto-${selectedColumnInfo.rowIndex}-${selectedColumnInfo.colIndex}`"
                >
                  Auto
                </label>
              </div>
            </div>

            <div
              v-if="selectedColumnInfo.columnSpec.kind === 'fixed'"
              class="mb-3"
            >
              <label class="form-label">
                <strong>Column Width (px)</strong>
                <small class="text-muted d-block">Fixed pixel width</small>
              </label>
              <input
                type="number"
                class="form-control"
                :value="selectedColumnInfo.columnValue"
                min="1"
                step="1"
                @input="
                  (e) => {
                    const value = Math.max(1, parseInt(e.target.value) || 200);
                    updateColumnValue(
                      selectedColumnInfo.rowIndex,
                      selectedColumnInfo.colIndex,
                      value,
                    );
                  }
                "
              />
            </div>
            <div
              v-if="selectedColumnInfo.columnSpec.kind === 'percent'"
              class="mb-3"
            >
              <label class="form-label">
                <strong>Column Width (%)</strong>
                <small class="text-muted d-block"
                  >Percentage of remaining width after fixed columns</small
                >
              </label>
              <input
                type="number"
                class="form-control"
                :value="selectedColumnInfo.columnValue"
                min="1"
                max="100"
                step="1"
                @input="
                  (e) => {
                    const value = Math.max(
                      1,
                      Math.min(100, parseInt(e.target.value) || 30),
                    );
                    updateColumnValue(
                      selectedColumnInfo.rowIndex,
                      selectedColumnInfo.colIndex,
                      value,
                    );
                  }
                "
              />
            </div>
            <div
              v-if="selectedColumnInfo.columnSpec.kind === 'auto'"
              class="alert alert-info mb-0"
            >
              <small>
                <strong>Auto:</strong> Column width adjusts automatically to fit
                content and takes all remaining space.
              </small>
            </div>

            <!-- Column Actions -->
            <div class="mt-3 pt-3 border-top">
              <h6 class="small mb-2">Quick Actions</h6>
              <div class="d-flex flex-column gap-2">
                <div class="d-flex gap-2 flex-wrap">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    :disabled="selectedColumnInfo.colIndex <= 0"
                    @click="
                      selectRegion(
                        getRegionId(
                          selectedColumnInfo.row.id,
                          selectedColumnInfo.colIndex - 1,
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
                      selectedColumnInfo.allColumns &&
                      selectedColumnInfo.allColumns.length === 0
                    "
                    @click="
                      removeColumn(
                        selectedColumnInfo.rowIndex,
                        selectedColumnInfo.colIndex,
                      )
                    "
                  >
                    <i class="fa-regular fa-square-minus"></i> Column
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    :disabled="
                      !selectedColumnInfo.allColumns ||
                      selectedColumnInfo.colIndex >=
                        selectedColumnInfo.allColumns.length - 1
                    "
                    @click="
                      selectRegion(
                        getRegionId(
                          selectedColumnInfo.row.id,
                          selectedColumnInfo.colIndex + 1,
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

    <!-- Widgets Selector Offcanvas (shows when plus icon clicked in edit mode) -->
    <div
      class="offcanvas offcanvas-end offcanvas-widgets-selector"
      tabindex="-1"
      :class="{ show: widgetsSelectorRegionId && editMode }"
      :aria-modal="!!(widgetsSelectorRegionId && editMode)"
      aria-labelledby="widgets-selector-offcanvas-label"
      :style="
        widgetsSelectorRegionId && editMode ? { visibility: 'visible' } : {}
      "
      data-bs-scroll="true"
      data-bs-backdrop="false"
    >
      <div class="offcanvas-header">
        <h5 id="widgets-selector-offcanvas-label" class="offcanvas-title">
          <i class="fa-brands fa-buromobelexperte"></i> Widgets Selector
        </h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="closeWidgetsSelector"
        />
      </div>
      <div class="offcanvas-body">
        <div v-if="widgetsSelectorColumnInfo" class="card">
          <div class="card-body">
            <div class="accordion accordion-flush" id="widgets-selector-accordion">
              <div
                v-for="(section, gIndex) in widgetsByGroup"
                :key="section.groupName"
                class="accordion-item"
              >
                <h2 class="accordion-header">
                  <button
                    :class="['accordion-button', { collapsed: gIndex !== 0 }]"
                    type="button"
                    :data-bs-toggle="'collapse'"
                    :data-bs-target="`#widgets-collapse-${gIndex}`"
                    :aria-expanded="gIndex === 0"
                    :aria-controls="`widgets-collapse-${gIndex}`"
                  >
                    {{ section.groupName }}
                  </button>
                </h2>
                <div
                  :id="`widgets-collapse-${gIndex}`"
                  :class="['accordion-collapse', 'collapse', { show: gIndex === 0 }]"
                  data-bs-parent="#widgets-selector-accordion"
                >
                  <div class="accordion-body py-2">
                    <ul class="list-unstyled mb-0">
                      <li
                        v-for="w in section.widgets"
                        :key="w.type"
                        class="widget-selector-item d-flex align-items-center gap-2 py-2 px-2 rounded"
                        :title="w.description"
                        role="button"
                        @click="addWidgetToSelectedRegion(w.type)"
                      >
                        <i :class="w.icon" class="text-secondary" aria-hidden="true"></i>
                        <span class="flex-grow-1">{{ w.friendlyName }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout-editor {
  width: 100%;
  padding: 1rem;
}

.preview-canvas {
  width: 100%;
  min-height: 400px;
}

.row-empty-placeholder {
  min-height: 80px;
  padding: 1rem;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem;
  cursor: default;
}

.row-empty-icon-box {
  border: 2px dashed #adb5bd;
  border-radius: 4px;
  padding: 1rem;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 4rem;
  cursor: pointer;
}

.row-empty-icon-box i,
.row-empty-icon-box :deep(i),
.row-empty-icon-box :deep(svg) {
  display: block !important;
  margin: auto !important;
  line-height: 1 !important;
}

.cell-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  cursor: default;
}

.cell-widget-preview {
  min-height: 0;
}
.cell-widget-preview > * {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
}

.preview-canvas > div {
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

/* Row action buttons - positioned top left */
.row-action-buttons {
  position: absolute;
  top: -4px;
  left: -4px;
  z-index: 10;
  pointer-events: auto;
}

.row-action-buttons .btn-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Cell action buttons - positioned top right */
.cell-action-buttons {
  position: absolute;
  top: -2px;
  right: -3px;
  z-index: 10;
  pointer-events: auto;
}

/* Row Settings button colors */
.row-action-buttons .row-settings-btn {
  background-color: #dee2e6;
  border-color: #dee2e6;
  color: #6c757d;
}

.row-action-buttons .row-settings-btn:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

/* Apply hover color when row is hovered (but not if button is selected) */
.preview-canvas > div:hover .row-action-buttons .row-settings-btn:not(.row-settings-btn-selected) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.row-action-buttons .row-settings-btn-selected {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
}

.row-action-buttons .row-settings-btn-selected:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
}

/* Keep red color when row is hovered and button is selected */
.preview-canvas > div:hover .row-action-buttons .row-settings-btn-selected {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
}

/* Cell Action Buttons colors */
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
.preview-canvas > div:hover .cell-action-buttons .cell-action-btn:not(.cell-action-btn-selected) {
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
.preview-canvas > div:hover .cell-action-buttons .cell-action-btn-selected {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

.preview-canvas > div:hover {
  border-color: #6c757d !important;
}

/* Selected row: red border takes precedence over hover */
.preview-canvas > div.row-selected {
  border-color: #dc3545 !important;
}

.preview-canvas > div.row-selected:hover {
  border-color: #dc3545 !important;
}

/* Selected cell: blue border takes precedence over hover */
.preview-canvas > div.cell-selected {
  border-color: #0d6efd !important;
}

.preview-canvas > div.cell-selected:hover {
  border-color: #0d6efd !important;
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

.offcanvas-column-editor,
.offcanvas-widgets-selector {
  width: 460px;
  max-width: 90vw;
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
