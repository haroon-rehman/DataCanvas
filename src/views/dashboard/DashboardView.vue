<script setup>
import { ref, computed, provide, watch } from "vue";
import { useRoute } from "vue-router";
import GridLayoutWidget, {
  buildPropertySchema as buildGridLayoutPropertySchema,
} from "../../components/dashboard/widgets/containers/GridLayoutWidget.vue";
import { normalizeColorValue } from "../../utils/colorUtils.js";
import PropertyGridWidget from "../../components/dashboard/_internals/PropertyGridWidget.vue";
import WidgetsSelectorWidget from "../../components/dashboard/_internals/WidgetsSelectorWidget.vue";
import SaveTileLayoutOffcanvas from "../../components/dashboard/_internals/SaveTileLayoutOffcanvas.vue";
import NewDashboardConfigOffcanvas from "../../components/dashboard/_internals/NewDashboardConfigOffcanvas.vue";

const route = useRoute();
const editMode = computed(() => route.query.edit === "1");

const defaultGridOptions = {
  column: 12,
  row: 6,
  cellHeightPx: 70,
  cellWidthPx: 120,
  sizeMode: "Computed",
  margin: 5,
  backgroundColor: "#F8F9FA",
  foregroundColor: "#212529",
};

const showPropertyEditor = ref(false);
const propertySchema = ref(null);
const propertyChangeHandler = ref(null);

function openPropertyEditor(propertySchemaData, opts = {}) {
  propertySchema.value = propertySchemaData;
  propertyChangeHandler.value = opts.update ?? null;
  showPropertyEditor.value = true;
}

function closePropertyEditor() {
  showPropertyEditor.value = false;
}

function handlePropertyChange(key, value) {
  if (propertyChangeHandler.value) {
    propertyChangeHandler.value(key, value);
  }
}

provide("openPropertyEditor", openPropertyEditor);

const showWidgetsSelector = ref(false);
const widgetsSelectorData = ref(null);

function openWidgetsSelector(widgetsByGroup, selectedRegionInfo, onAddWidget) {
  widgetsSelectorData.value = {
    widgetsByGroup,
    selectedRegionInfo,
    onAddWidget,
  };
  showWidgetsSelector.value = true;
}

function closeWidgetsSelector() {
  showWidgetsSelector.value = false;
  widgetsSelectorData.value = null;
}

function handleWidgetSelected(widgetType) {
  const data = widgetsSelectorData.value;
  if (data?.onAddWidget) {
    data.onAddWidget(widgetType);
  }
  closeWidgetsSelector();
}

provide("openWidgetsSelector", openWidgetsSelector);
provide("closeWidgetsSelector", closeWidgetsSelector);
provide("onWidgetSelected", handleWidgetSelected);

const widgets = ref([]);
const gridOptions = ref({ ...defaultGridOptions });
const dashboardLoading = ref(false);
const dashboardLoadError = ref(null);
const currentDashboardMeta = ref(null);
/** When true, show NewDashboardConfigOffcanvas before rendering grid (new dashboard only) */
const showNewDashboardConfig = ref(false);

function createWidgetId() {
  try {
    // browsers only; ok to fall back if unavailable
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureWidgetIds(list) {
  if (!Array.isArray(list)) return [];
  return list.map((w) => {
    if (w && typeof w === "object" && w.id) return w;
    if (w && typeof w === "object") return { ...w, id: createWidgetId() };
    return w;
  });
}

async function loadDashboardById(id) {
  if (!id) {
    widgets.value = [];
    gridOptions.value = { ...defaultGridOptions };
    dashboardLoadError.value = null;
    currentDashboardMeta.value = null;
    dashboardLoading.value = false;
    showNewDashboardConfig.value = true;
    return;
  }
  showNewDashboardConfig.value = false;
  dashboardLoading.value = true;
  dashboardLoadError.value = null;
  currentDashboardMeta.value = null;
  try {
    const res = await fetch(`/config/dashboards/${id}.json`);
    if (!res.ok) throw new Error(`Dashboard not found: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.widgets)) throw new Error("Invalid dashboard file");
    widgets.value = ensureWidgetIds(data.widgets);
    const loaded = { ...defaultGridOptions, ...(data.gridOptions || {}) };
    delete loaded.maxColumn;
    if (loaded.sizeMode === "computed") loaded.sizeMode = "Computed";
    if (loaded.sizeMode === "auto") loaded.sizeMode = "Auto";
    if (loaded.backgroundColor)
      loaded.backgroundColor = normalizeColorValue(loaded.backgroundColor) ?? loaded.backgroundColor;
    if (loaded.foregroundColor)
      loaded.foregroundColor = normalizeColorValue(loaded.foregroundColor) ?? loaded.foregroundColor;
    gridOptions.value = loaded;
    currentDashboardMeta.value = {
      id: data.id || id,
      label: data.label || id,
      description: data.description || "",
    };
  } catch (e) {
    dashboardLoadError.value = e.message;
    widgets.value = [];
    gridOptions.value = { ...defaultGridOptions };
  } finally {
    dashboardLoading.value = false;
  }
}

watch(
  () => route.query.id,
  (id) => loadDashboardById(id),
  { immediate: true },
);

function resetToDefault() {
  const id = route.query.id;
  if (id) {
    loadDashboardById(id);
  } else {
    widgets.value = [];
    gridOptions.value = { ...defaultGridOptions };
    showNewDashboardConfig.value = true;
  }
}

function handleNewDashboardConfigConfirm(config) {
  const merged = { ...defaultGridOptions, ...config };
  delete merged.maxColumn;
  gridOptions.value = merged;
  showNewDashboardConfig.value = false;
}

function handleNewDashboardConfigClose() {
  showNewDashboardConfig.value = false;
  gridOptions.value = { ...defaultGridOptions };
}

const showSaveDashboard = ref(false);

function openSaveDashboard() {
  showSaveDashboard.value = true;
}

function openSaveAs() {
  showSaveDashboard.value = true;
}

function closeSaveDashboard() {
  showSaveDashboard.value = false;
}

/** gridOptions for save — exclude maxColumn; normalize to cellHeightPx/cellWidthPx; strip removed props; normalize colors; ensure numeric types. */
function getGridOptionsForSave() {
  const opts = { ...gridOptions.value };
  delete opts.maxColumn;
  if (opts.column != null) opts.column = Number(opts.column) || defaultGridOptions.column;
  if (opts.row != null) opts.row = Number(opts.row) || defaultGridOptions.row;
  if (opts.cellHeightPx != null) opts.cellHeightPx = Number(opts.cellHeightPx) || defaultGridOptions.cellHeightPx;
  if (opts.cellWidthPx != null) opts.cellWidthPx = Number(opts.cellWidthPx) || defaultGridOptions.cellWidthPx;
  if (opts.backgroundColor)
    opts.backgroundColor = normalizeColorValue(opts.backgroundColor) ?? opts.backgroundColor;
  if (opts.foregroundColor)
    opts.foregroundColor = normalizeColorValue(opts.foregroundColor) ?? opts.foregroundColor;
  if (opts.cellHeightPx == null && opts.cellHeight != null) {
    opts.cellHeightPx =
      parseCellSize(opts.cellHeight) ?? defaultGridOptions.cellHeightPx;
  }
  if (opts.cellWidthPx == null && opts.cellWidth != null) {
    opts.cellWidthPx =
      parseCellSize(opts.cellWidth) ?? defaultGridOptions.cellWidthPx;
  }
  delete opts.cellHeight;
  delete opts.cellWidth;
  delete opts.contentHorizontalAlignment;
  delete opts.contentVerticalAlignment;
  delete opts.dock;
  delete opts.horizontalAlignment;
  delete opts.verticalAlignment;
  return opts;
}

function getDashboardPayload() {
  return {
    id: currentDashboardMeta.value?.id,
    label: currentDashboardMeta.value?.label,
    description: currentDashboardMeta.value?.description,
    widgets: widgets.value,
    gridOptions: getGridOptionsForSave(),
  };
}

function downloadDashboardAsFile(payload) {
  const now = new Date().toISOString();
  const file = {
    id: payload.id,
    label: payload.label,
    description: payload.description,
    created: now,
    updated: now,
    widgets: payload.widgets,
    gridOptions: payload.gridOptions,
  };
  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${payload.id}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function parseCellSize(val) {
  if (val == null) return null;
  if (typeof val === "number") return val;
  const match = String(val).match(/^([\d.]+)\s*px$/i);
  return match ? Number(match[1]) : null;
}

function getDashboardSettingsSchema() {
  const meta = currentDashboardMeta.value;
  const opts = gridOptions.value;
  const merged = {
    identifier: meta?.id ?? "",
    label: meta?.label ?? "",
    description: meta?.description ?? "",
    rows: opts?.row ?? defaultGridOptions.row,
    columns: opts?.column ?? defaultGridOptions.column,
    cellHeightPx:
      opts?.cellHeightPx ??
      parseCellSize(opts?.cellHeight) ??
      defaultGridOptions.cellHeightPx,
    cellWidthPx:
      opts?.cellWidthPx ??
      parseCellSize(opts?.cellWidth) ??
      defaultGridOptions.cellWidthPx,
    sizeMode: opts?.sizeMode ?? defaultGridOptions.sizeMode ?? "Computed",
    backgroundColor:
      opts?.backgroundColor ?? defaultGridOptions.backgroundColor,
    foregroundColor:
      opts?.foregroundColor ?? defaultGridOptions.foregroundColor,
  };
  const gridLayoutSchema = buildGridLayoutPropertySchema(merged);
  return gridLayoutSchema;
}

function handleSettings() {
  const schema = getDashboardSettingsSchema();
  openPropertyEditor(schema, {
    update(key, value) {
      if (["identifier", "label", "description"].includes(key)) {
        if (!currentDashboardMeta.value) {
          currentDashboardMeta.value = { id: "", label: "", description: "" };
        }
        const metaKey = key === "identifier" ? "id" : key;
        currentDashboardMeta.value = {
          ...currentDashboardMeta.value,
          [metaKey]: value,
        };
      } else {
        const gridKey =
          key === "rows" ? "row" : key === "columns" ? "column" : key;
        let v = value;
        if (gridKey === "backgroundColor" || gridKey === "foregroundColor") {
          v = normalizeColorValue(value) ?? value;
        } else if (
          ["row", "column", "cellHeightPx", "cellWidthPx"].includes(gridKey)
        ) {
          const n = Number(value);
          v = Number.isNaN(n) ? value : n;
        }
        gridOptions.value = { ...gridOptions.value, [gridKey]: v };
      }
    },
  });
}

async function handleSaveDirect() {
  const meta = currentDashboardMeta.value;
  if (!meta) return;
  const payload = {
    id: meta.id,
    label: meta.label,
    description: meta.description,
    widgets: widgets.value,
    gridOptions: getGridOptionsForSave(),
  };
  await handleSaveDashboard(payload);
}

async function handleSaveDashboard(payload) {
  try {
    const res = await fetch("/api/save-dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    if (res.ok) {
      closeSaveDashboard();
      alert(`Dashboard saved to config/dashboards/${data.filename}`);
      return;
    }
    if (res.status === 404) {
      closeSaveDashboard();
      downloadDashboardAsFile(payload);
      alert(
        "Save API not available (run with npm run dev for server save). Dashboard downloaded as file.",
      );
      return;
    }
    throw new Error(data.error || `Save failed: ${res.status}`);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      closeSaveDashboard();
      downloadDashboardAsFile(payload);
      alert("Save API not available. Dashboard downloaded as file.");
      return;
    }
    console.error("Failed to save dashboard:", err);
    alert(`Failed to save: ${err.message}`);
  }
}

function importJSON() {
  navigator.clipboard
    .readText()
    .then((text) => {
      const data = JSON.parse(text);
      widgets.value = ensureWidgetIds(data.widgets || []);
      const imported = { ...defaultGridOptions, ...(data.gridOptions || {}) };
      delete imported.maxColumn;
      if (imported.sizeMode === "computed") imported.sizeMode = "Computed";
      if (imported.sizeMode === "auto") imported.sizeMode = "Auto";
      if (imported.backgroundColor)
        imported.backgroundColor = normalizeColorValue(imported.backgroundColor) ?? imported.backgroundColor;
      if (imported.foregroundColor)
        imported.foregroundColor = normalizeColorValue(imported.foregroundColor) ?? imported.foregroundColor;
      gridOptions.value = imported;
      alert("JSON imported!");
    })
    .catch((err) => {
      console.error("Failed to import:", err);
      alert("Failed to import JSON");
    });
}

/** Payload for SaveTileLayoutOffcanvas — layout holds { widgets, gridOptions } (maxColumn excluded). */
const dashboardSavePayload = computed(() => ({
  widgets: widgets.value,
  gridOptions: getGridOptionsForSave(),
}));
</script>

<template>
  <div>
    <div v-if="dashboardLoadError" class="alert alert-warning mb-3">
      <i class="fa-solid fa-triangle-exclamation me-2"></i>
      {{ dashboardLoadError }}
    </div>
    <div v-else-if="dashboardLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading dashboard...</span>
      </div>
    </div>

    <div v-if="editMode" class="card mb-3">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">Dashboard Editor</h5>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-danger" @click="resetToDefault">
            Reset
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#dashboard-json-collapse"
            aria-expanded="false"
            aria-controls="dashboard-json-collapse"
          >
            Show JSON
          </button>
          <button class="btn btn-sm btn-outline-success" @click="importJSON">
            Import JSON
          </button>
          <div class="btn-group" role="group" aria-label="Save">
            <div class="btn-group" role="group">
              <button
                type="button"
                class="btn btn-sm btn-primary dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Options
              </button>
              <ul class="dropdown-menu">
                <li v-if="currentDashboardMeta">
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="handleSettings"
                    ><i class="fa-solid fa-gear"></i> Settings</a
                  >
                </li>
                <li v-if="currentDashboardMeta">
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="handleSaveDirect"
                    ><i class="fa-solid fa-save"></i> Save</a
                  >
                </li>
                <li v-if="currentDashboardMeta">
                  <a class="dropdown-item" href="#" @click.prevent="openSaveAs"
                    ><i class="fa-solid fa-save"></i> Save As</a
                  >
                </li>
                <li v-if="!currentDashboardMeta">
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="openSaveDashboard"
                    ><i class="fa-solid fa-save"></i> Save Dashboard</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="collapse" id="dashboard-json-collapse">
        <div class="card-body border-top">
          <pre
            class="mb-0 bg-light p-3 rounded overflow-auto"
            style="max-height: 400px"
          ><code>{{ JSON.stringify({ widgets, gridOptions }, null, 2) }}</code></pre>
        </div>
      </div>
    </div>

    <div
      v-if="!dashboardLoading && !showNewDashboardConfig"
      class="w-100"
      style="min-height: 400px; overflow: hidden"
    >
      <GridLayoutWidget
        key="dashboard-grid"
        :widgets="widgets"
        @update:widgets="widgets = ensureWidgetIds($event)"
        :grid-options="gridOptions"
        :size-mode="gridOptions.sizeMode ?? 'Computed'"
        :update-grid-options="
          (k, v) => {
            const key = k === 'rows' ? 'row' : k === 'columns' ? 'column' : k;
            gridOptions.value = { ...gridOptions.value, [key]: v };
          }
        "
        :background-color="gridOptions.backgroundColor ?? '#F8F9FA'"
        :foreground-color="gridOptions.foregroundColor ?? '#212529'"
        :identifier="currentDashboardMeta?.label ?? ''"
        :edit-mode="editMode"
      />
    </div>

    <PropertyGridWidget
      :show="showPropertyEditor"
      :property-schema="propertySchema"
      :on-property-change="handlePropertyChange"
      @close="closePropertyEditor"
    />
    <WidgetsSelectorWidget
      :show="showWidgetsSelector"
      :widgets-by-group="widgetsSelectorData?.widgetsByGroup || []"
      :selected-region-info="widgetsSelectorData?.selectedRegionInfo || null"
      @close="closeWidgetsSelector"
      @select-widget="handleWidgetSelected"
    />
    <SaveTileLayoutOffcanvas
      :show="showSaveDashboard"
      :layout="dashboardSavePayload"
      title="Save Dashboard"
      label-placeholder="e.g. Main Dashboard"
      @close="closeSaveDashboard"
      @save="
        (p) =>
          handleSaveDashboard({
            id: p.id,
            label: p.label,
            description: p.description,
            widgets: p.layout?.widgets ?? [],
            gridOptions: p.layout?.gridOptions ?? gridOptions,
          })
      "
    />
    <NewDashboardConfigOffcanvas
      :show="showNewDashboardConfig"
      :default-column="defaultGridOptions.column"
      :default-row="defaultGridOptions.row"
      :default-cell-height-px="defaultGridOptions.cellHeightPx ?? 70"
      :default-cell-width-px="defaultGridOptions.cellWidthPx ?? 120"
      :default-size-mode="defaultGridOptions.sizeMode ?? 'Computed'"
      @close="handleNewDashboardConfigClose"
      @confirm="handleNewDashboardConfigConfirm"
    />
  </div>
</template>
