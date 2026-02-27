<script setup>
import { ref, computed, provide, watch } from "vue";
import { useRoute } from "vue-router";
import { getDefaultTemplate } from "../../utils/tileLayoutDefaults";
import TileLayoutWidget from "../../components/dashboard/widgets/containers/TileLayoutWidget.vue";
import GridLayoutWidget, {
  gridDefaults as gridLayoutGridDefaults,
} from "../../components/dashboard/widgets/containers/GridLayoutWidget.vue";
import IconValueWidget, {
  gridDefaults as iconValueGridDefaults,
} from "../../components/dashboard/widgets/metrics/IconValueWidget.vue";
import ValueWidget, {
  gridDefaults as valueGridDefaults,
} from "../../components/dashboard/widgets/metrics/ValueWidget.vue";
import PieChartWidget, {
  gridDefaults as pieChartGridDefaults,
} from "../../components/dashboard/widgets/metrics/PieChartWidget.vue";
import BarChartWidget, {
  gridDefaults as barChartGridDefaults,
} from "../../components/dashboard/widgets/metrics/BarChartWidget.vue";
import RadarChartWidget, {
  gridDefaults as radarChartGridDefaults,
} from "../../components/dashboard/widgets/metrics/RadarChartWidget.vue";
import DoughnutChartWidget, {
  gridDefaults as doughnutChartGridDefaults,
} from "../../components/dashboard/widgets/metrics/DoughnutChartWidget.vue";
import LineChartWidget, {
  gridDefaults as lineChartGridDefaults,
} from "../../components/dashboard/widgets/metrics/LineChartWidget.vue";
import PolarAreaChartWidget, {
  gridDefaults as polarAreaChartGridDefaults,
} from "../../components/dashboard/widgets/metrics/PolarAreaChartWidget.vue";
import ScatterChartWidget, {
  gridDefaults as scatterChartGridDefaults,
} from "../../components/dashboard/widgets/metrics/ScatterChartWidget.vue";
import HeatmapChartWidget, {
  gridDefaults as heatmapChartGridDefaults,
} from "../../components/dashboard/widgets/metrics/HeatmapChartWidget.vue";
import AudioPlayerWidget, {
  gridDefaults as audioPlayerGridDefaults,
} from "../../components/dashboard/widgets/media/AudioPlayerWidget.vue";
import PropertyGridWidget from "../../components/dashboard/_internals/PropertyGridWidget.vue";
import WidgetsSelectorWidget from "../../components/dashboard/_internals/WidgetsSelectorWidget.vue";
import SaveTileLayoutOffcanvas from "../../components/dashboard/_internals/SaveTileLayoutOffcanvas.vue";

const route = useRoute();
const editMode = computed(() => route.query.edit === "1");

const widgetComponents = {
  IconValueWidget,
  ValueWidget,
  GridLayoutWidget,
  TileLayoutWidget,
  PieChartWidget,
  BarChartWidget,
  RadarChartWidget,
  DoughnutChartWidget,
  LineChartWidget,
  PolarAreaChartWidget,
  ScatterChartWidget,
  HeatmapChartWidget,
  AudioPlayerWidget,
};
const gridDefaultsByType = {
  IconValueWidget: iconValueGridDefaults,
  ValueWidget: valueGridDefaults,
  GridLayoutWidget: gridLayoutGridDefaults,
  PieChartWidget: pieChartGridDefaults,
  BarChartWidget: barChartGridDefaults,
  RadarChartWidget: radarChartGridDefaults,
  DoughnutChartWidget: doughnutChartGridDefaults,
  LineChartWidget: lineChartGridDefaults,
  PolarAreaChartWidget: polarAreaChartGridDefaults,
  ScatterChartWidget: scatterChartGridDefaults,
  HeatmapChartWidget: heatmapChartGridDefaults,
  AudioPlayerWidget: audioPlayerGridDefaults,
};
const gridOptions = {
  column: 3,
  cellHeight: "70px",
  cellWidth: "120px",
  margin: 5,
};

const showPropertyEditor = ref(false);
const propertySchema = ref(null);
const propertyChangeHandler = ref(null);

function openPropertyEditor(propertySchemaData, opts = {}) {
  if (!editMode.value) return;
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

const layout = ref(getDefaultTemplate());
const layoutLoading = ref(false);
const layoutLoadError = ref(null);
/** Metadata of the currently loaded layout (id, label, description) when editing an existing one */
const currentLayoutMeta = ref(null);

async function loadLayoutById(id) {
  if (!id) {
    layout.value = getDefaultTemplate();
    layoutLoadError.value = null;
    currentLayoutMeta.value = null;
    return;
  }
  layoutLoading.value = true;
  layoutLoadError.value = null;
  currentLayoutMeta.value = null;
  try {
    // Prefer new location (public/config/tilelayouts). Fallback to legacy (public/config root).
    let res = await fetch(`/config/tilelayouts/${id}.json`);
    if (!res.ok) {
      res = await fetch(`/config/${id}.json`);
    }
    if (!res.ok) throw new Error(`Layout not found: ${res.status}`);
    const data = await res.json();
    if (!data.layout) throw new Error("Invalid layout file");
    layout.value = data.layout;
    currentLayoutMeta.value = {
      id: data.id || id,
      label: data.label || id,
      description: data.description || "",
    };
  } catch (e) {
    layoutLoadError.value = e.message;
    layout.value = getDefaultTemplate();
  } finally {
    layoutLoading.value = false;
  }
}

watch(
  () => route.query.id,
  (id) => loadLayoutById(id),
  { immediate: true },
);

/**
 * Reset: for new layout → default template; for existing layout → discard changes and reload saved version.
 */
function resetToDefault() {
  const id = route.query.id;
  if (id) {
    loadLayoutById(id);
  } else {
    layout.value = getDefaultTemplate();
  }
}

const showSaveTileLayout = ref(false);

function openSaveTileLayout() {
  showSaveTileLayout.value = true;
}

function openSaveAs() {
  showSaveTileLayout.value = true;
}

function closeSaveTileLayout() {
  showSaveTileLayout.value = false;
}

/** Save directly (overwrite existing) — used when editing an existing layout */
async function handleSaveDirect() {
  const meta = currentLayoutMeta.value;
  if (!meta) return;
  const payload = {
    id: meta.id,
    label: meta.label,
    description: meta.description,
    layout: layout.value,
  };
  await handleSaveTileLayout(payload);
}

function downloadLayoutAsFile(payload) {
  const now = new Date().toISOString();
  const file = {
    id: payload.id,
    label: payload.label,
    description: payload.description,
    created: now,
    updated: now,
    layout: payload.layout,
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

async function handleSaveTileLayout(payload) {
  try {
    const res = await fetch("/api/save-tile-layout", {
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
      closeSaveTileLayout();
      alert(`Layout saved to config/tilelayouts/${data.filename}`);
      return;
    }
    if (res.status === 404) {
      closeSaveTileLayout();
      downloadLayoutAsFile(payload);
      alert(
        "Save API not available (run with npm run dev for server save). Layout downloaded as file.",
      );
      return;
    }
    throw new Error(data.error || `Save failed: ${res.status}`);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      closeSaveTileLayout();
      downloadLayoutAsFile(payload);
      alert("Save API not available. Layout downloaded as file.");
      return;
    }
    console.error("Failed to save layout:", err);
    alert(`Failed to save: ${err.message}`);
  }
}

/**
 * Import a JSON string into the layout.
 */
function importJSON() {
  navigator.clipboard
    .readText()
    .then((text) => {
      layout.value = JSON.parse(text);
      alert("JSON imported!");
    })
    .catch((err) => {
      console.error("Failed to import:", err);
      alert("Failed to import JSON");
    });
}
</script>

<template>
  <div>
    <div v-if="layoutLoadError" class="alert alert-warning mb-3">
      <i class="fa-solid fa-triangle-exclamation me-2"></i>
      {{ layoutLoadError }}
    </div>
    <div v-else-if="layoutLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading layout...</span>
      </div>
    </div>

    <!-- Editor toolbar (edit mode only: add ?edit=1 to URL) -->
    <div v-if="editMode" class="card mb-3">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">Tile Layout Editor</h5>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-danger" @click="resetToDefault">
            Reset
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#tile-layout-json-collapse"
            aria-expanded="false"
            aria-controls="tile-layout-json-collapse"
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
                <li v-if="currentLayoutMeta">
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="handleSaveDirect"
                    ><i class="fa-solid fa-save"></i> Save</a
                  >
                </li>
                <li v-if="currentLayoutMeta">
                  <a class="dropdown-item" href="#" @click.prevent="openSaveAs"
                    ><i class="fa-solid fa-save"></i> Save As</a
                  >
                </li>
                <li v-if="!currentLayoutMeta">
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="openSaveTileLayout"
                    ><i class="fa-solid fa-save"></i> Save Tile Layout</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="collapse" id="tile-layout-json-collapse">
        <div class="card-body border-top">
          <pre
            class="mb-0 bg-light p-3 rounded overflow-auto"
            style="max-height: 400px"
          ><code>{{ JSON.stringify(layout, null, 2) }}</code></pre>
        </div>
      </div>
    </div>

    <div v-if="!layoutLoading" class="w-100" style="height: 100vh">
      <TileLayoutWidget
        v-model="layout"
        :widget-components="widgetComponents"
        :grid-defaults-by-type="gridDefaultsByType"
        :grid-options="gridOptions"
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
      :show="showSaveTileLayout"
      :layout="layout"
      @close="closeSaveTileLayout"
      @save="handleSaveTileLayout"
    />
  </div>
</template>
