<!--
  Usage Example for TableLayoutWidget.vue
  
  This file demonstrates how to use the TableLayoutWidget component.
  You can copy this code into your view or component.
-->

<script setup>
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import TableLayoutWidget from '../../components/dashboard/widgets/containers/TableLayoutWidget.backup2.vue'
import PropertyGridWidget from '../../components/dashboard/_internals/PropertyGridWidget.vue'
import WidgetsSelectorWidget from '../../components/dashboard/_internals/WidgetsSelectorWidget.vue'
import GridLayoutWidget, { gridDefaults as gridLayoutGridDefaults } from '../../components/dashboard/widgets/containers/GridLayoutWidget.vue'
import IconValueWidget, { gridDefaults as iconValueGridDefaults } from '../../components/dashboard/widgets/metrics/IconValueWidget.vue'

const route = useRoute()
const editMode = computed(() => route.query.edit === '1')

// Widget components for layout editor preview (same as DashboardExampleView)
const contentWidgetComponents = { IconValueWidget, TableLayoutWidget }
const widgetComponents = { IconValueWidget, GridLayoutWidget, TableLayoutWidget }
const contentGridDefaultsByType = {
  IconValueWidget: iconValueGridDefaults,
  GridLayoutWidget: gridLayoutGridDefaults,
}
const contentGridOptions = {
  column: 3,
  maxColumn: 3,
  row: 6,
  cellHeight: '70px',
  cellWidth: '120px',
  margin: 5,
}

// Property editor state (for editing widget props when clicking a widget in preview)
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

// Widgets selector state (for adding widgets to cells)
const showWidgetsSelector = ref(false)
const widgetsSelectorData = ref(null) // { widgetsByGroup, selectedRegionInfo, onAddWidget? }
const tableLayoutRef = ref(null)

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
  } else if (tableLayoutRef.value?.addWidgetToSelectedRegion) {
    tableLayoutRef.value.addWidgetToSelectedRegion(widgetType)
  }
  closeWidgetsSelector()
}

provide('openWidgetsSelector', openWidgetsSelector)
provide('closeWidgetsSelector', closeWidgetsSelector)
provide('onWidgetSelected', handleWidgetSelected)

// Initialize with default template
const layout = ref(getDefaultTemplate())

function generateRowId() {
  return `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getDefaultTemplate() {
  return {
    rows: [
      {
        id: generateRowId(),
        height: { kind: 'percent', percent: '100%' },
        columns: [
          { kind: 'auto' },
          { kind: 'auto' },
          { kind: 'auto' },
        ],
      },
    ],
  }
}

function resetToDefault() {
  layout.value = getDefaultTemplate()
}

function exportJSON() {
  const json = JSON.stringify(layout.value, null, 2)
  navigator.clipboard.writeText(json).then(() => {
    alert('JSON copied to clipboard!')
  }).catch((err) => {
    console.error('Failed to copy:', err)
    alert('Failed to copy to clipboard')
  })
}

function importJSON() {
  const json = navigator.clipboard.readText()
  layout.value = JSON.parse(json).then(() => {
    alert('JSON imported!')
  }).catch((err) => {
    console.error('Failed to import:', err)
    alert('Failed to import JSON')
  })
}
</script>

<template>
      <!-- Editor Controls (edit mode only) -->
      <div v-if="editMode" class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Dashboard Layout Editor</h5>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-danger" @click="resetToDefault">
            Reset
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#layout-json-collapse"
            aria-expanded="false"
            aria-controls="layout-json-collapse"
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
      <div class="collapse" id="layout-json-collapse">
        <div class="card-body border-top">
          <pre class="mb-0 bg-light p-3 rounded overflow-auto" style="max-height: 400px;"><code>{{ JSON.stringify(layout, null, 2) }}</code></pre>
        </div>
      </div>
    </div>
    
    <div class="w-100">
      <TableLayoutWidget
        ref="tableLayoutRef"
        v-model="layout"
        :widget-components="widgetComponents"
        :content-widget-components="contentWidgetComponents"
        :grid-defaults-by-type="contentGridDefaultsByType"
        :grid-options="contentGridOptions"
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
</template>

<style scoped>
.dashboard-editor-wrapper {
  min-width: 0;
  max-width: 100%;
  overflow: auto;
}
</style>
