<script setup>
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import { getDefaultTemplate } from '../utils/tileLayoutDefaults'
import TileLayoutWidget from '../components/dashboard/widgets/containers/TileLayoutWidget.vue'
import GridLayoutWidget, { gridDefaults as gridLayoutGridDefaults } from '../components/dashboard/widgets/containers/GridLayoutWidget.vue'
import IconValueWidget, { gridDefaults as iconValueGridDefaults } from '../components/dashboard/widgets/metrics/IconValueWidget.vue'
import ValueWidget, { gridDefaults as valueGridDefaults } from '../components/dashboard/widgets/metrics/ValueWidget.vue'
import PieChartWidget, { gridDefaults as pieChartGridDefaults } from '../components/dashboard/widgets/metrics/PieChartWidget.vue'
import BarChartWidget, { gridDefaults as barChartGridDefaults } from '../components/dashboard/widgets/metrics/BarChartWidget.vue'
import PropertyGridWidget from '../components/dashboard/_internals/PropertyGridWidget.vue'
import WidgetsSelectorWidget from '../components/dashboard/_internals/WidgetsSelectorWidget.vue'

const route = useRoute()
const editMode = computed(() => route.query.edit === '1')

const widgetComponents = {
  IconValueWidget,
  ValueWidget,
  GridLayoutWidget,
  TileLayoutWidget,
  PieChartWidget,
  BarChartWidget,
}
const gridDefaultsByType = {
  IconValueWidget: iconValueGridDefaults,
  ValueWidget: valueGridDefaults,
  GridLayoutWidget: gridLayoutGridDefaults,
  PieChartWidget: pieChartGridDefaults,
  BarChartWidget: barChartGridDefaults,
}
const gridOptions = {
  column: 3,
  cellHeight: '70px',
  cellWidth: '120px',
  margin: 5,
}

const showPropertyEditor = ref(false)
const propertySchema = ref(null)
const propertyChangeHandler = ref(null)

function openPropertyEditor(propertySchemaData, opts = {}) {
  propertySchema.value = propertySchemaData
  propertyChangeHandler.value = opts.update ?? null
  showPropertyEditor.value = true
}

function closePropertyEditor() {
  showPropertyEditor.value = false
}

function handlePropertyChange(key, value) {
  if (propertyChangeHandler.value) {
    propertyChangeHandler.value(key, value)
  }
}

provide('openPropertyEditor', openPropertyEditor)

const showWidgetsSelector = ref(false)
const widgetsSelectorData = ref(null)

function openWidgetsSelector(widgetsByGroup, selectedRegionInfo, onAddWidget) {
  widgetsSelectorData.value = { widgetsByGroup, selectedRegionInfo, onAddWidget }
  showWidgetsSelector.value = true
}

function closeWidgetsSelector() {
  showWidgetsSelector.value = false
  widgetsSelectorData.value = null
}

function handleWidgetSelected(widgetType) {
  const data = widgetsSelectorData.value
  if (data?.onAddWidget) {
    data.onAddWidget(widgetType)
  }
  closeWidgetsSelector()
}

provide('openWidgetsSelector', openWidgetsSelector)
provide('closeWidgetsSelector', closeWidgetsSelector)
provide('onWidgetSelected', handleWidgetSelected)

const layout = ref(getDefaultTemplate())

/**
 * Reset the layout to the default template.
 */
function resetToDefault() {
  layout.value = getDefaultTemplate()
}

/**
 * Export the layout as a JSON string.
 */
function exportJSON() {
  const json = JSON.stringify(layout.value, null, 2)
  navigator.clipboard.writeText(json).then(() => {
    alert('JSON copied to clipboard!')
  }).catch((err) => {
    console.error('Failed to copy:', err)
    alert('Failed to copy to clipboard')
  })
}

/**
 * Import a JSON string into the layout.
 */
function importJSON() {
  navigator.clipboard.readText().then((text) => {
    layout.value = JSON.parse(text)
    alert('JSON imported!')
  }).catch((err) => {
    console.error('Failed to import:', err)
    alert('Failed to import JSON')
  })
}
</script>

<template>
  <div>

    <!-- Editor toolbar (edit mode only: add ?edit=1 to URL) -->
  <div v-if="editMode" class="card mb-3">
    <div class="card-header d-flex justify-content-between align-items-center">
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
        <button class="btn btn-sm btn-outline-primary" @click="exportJSON">
          Export JSON
        </button>
      </div>
    </div>
    <div class="collapse" id="tile-layout-json-collapse">
      <div class="card-body border-top">
        <pre class="mb-0 bg-light p-3 rounded overflow-auto" style="max-height: 400px;"><code>{{ JSON.stringify(layout, null, 2) }}</code></pre>
      </div>
    </div>
  </div>

    <div class="w-100" style="height: 100vh;">
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
  </div>
</template>
