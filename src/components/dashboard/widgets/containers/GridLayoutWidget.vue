<script>
import IconValueWidget from '../metrics/IconValueWidget.vue'
import ValueWidget from '../metrics/ValueWidget.vue'
import PieChartWidget from '../metrics/PieChartWidget.vue'
import BarChartWidget from '../metrics/BarChartWidget.vue'
import { gridDefaults as iconValueGridDefaults } from '../metrics/IconValueWidget.vue'
import { gridDefaults as valueGridDefaults } from '../metrics/ValueWidget.vue'
import { gridDefaults as pieChartGridDefaults } from '../metrics/PieChartWidget.vue'
import { gridDefaults as barChartGridDefaults } from '../metrics/BarChartWidget.vue'

/** Default grid size when this widget is used inside a layout. */
export const gridDefaults = { w: 2, h: 2, minW: 1, minH: 1 }

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: 'Grid Layout',
  description: 'A grid of nested widgets with drag-and-drop layout.',
  icon: 'fa-solid fa-th',
  group: 'Layout',
}

/** Full property metadata for GridLayoutWidget. */
export const PROP_SCHEMA = {
  identifier: { type: 'string', default: '', control: 'text', label: 'Identifier' },
  rows: { type: 'number', default: 12, control: 'number', label: 'Number of rows' },
  columns: { type: 'number', default: 12, control: 'number', label: 'Number of columns' },
  cellHeight: { type: 'string', default: '70px', control: 'text', label: 'Cell height' },
  cellWidth: { type: 'string', default: '120px', control: 'text', label: 'Cell width' },
  backgroundColor: { type: 'string', default: '', control: 'colorBoth', label: 'Background color' },
  foregroundColor: { type: 'string', default: '', control: 'colorPure', label: 'Foreground color' },
  horizontalAlignment: { type: 'string', default: 'center', control: 'select', options: ['start', 'center', 'end'], label: 'Horizontal alignment' },
  verticalAlignment: { type: 'string', default: 'start', control: 'select', options: ['start', 'center', 'end'], label: 'Vertical alignment' },
  contentHorizontalAlignment: { type: 'string', default: 'start', control: 'select', options: ['start', 'center', 'end'], label: 'Content horizontal alignment' },
  contentVerticalAlignment: { type: 'string', default: 'start', control: 'select', options: ['start', 'center', 'end'], label: 'Content vertical alignment' },
  dock: { type: 'string', default: 'none', control: 'select', options: ['none', 'top', 'left', 'right', 'bottom', 'fill'], label: 'Dock' },
}

/** Prop names grouped by category. */
const CONFIGURABLE_PROPS_BY_GROUP = {
  general: ['identifier'],
  docking: ['dock'],
  grid: ['rows', 'columns', 'cellHeight', 'cellWidth'],
  appearance: ['backgroundColor', 'foregroundColor'],
  alignment: ['horizontalAlignment', 'verticalAlignment', 'contentHorizontalAlignment', 'contentVerticalAlignment'],
}

/** Builds property schema for PropertyGridWidget from widget props. */
export function buildPropertySchema(props = {}) {
  const displayLabel = props.identifier || 'GridLayout'
  const children = Object.entries(CONFIGURABLE_PROPS_BY_GROUP).map(([groupName, keys]) => ({
    label: groupName.charAt(0).toUpperCase() + groupName.slice(1),
    children: keys
      .filter((key) => PROP_SCHEMA[key])
      .map((key) => {
        const schema = PROP_SCHEMA[key]
        const current = props[key]
        const value = current === undefined || current === null ? schema.default : current
        return {
          key,
          label: schema.label ?? key,
          value,
          type: schema.type,
          default: schema.default,
          control: schema.control ?? 'text',
          options: schema.options ?? null,
          children: [],
        }
      }),
  }))
  return {
    label: `GridLayout: ${displayLabel}`,
    children,
  }
}

/** Allowed child widget types: type name -> component. Only these are rendered as grid items. Also used as default widgetComponents. */
export const ALLOWED_CHILD_TYPES = {
  IconValueWidget,
  ValueWidget,
  PieChartWidget,
  BarChartWidget,
}

/** Default grid defaults when not provided. */
export const DEFAULT_GRID_DEFAULTS_BY_TYPE = {
  IconValueWidget: iconValueGridDefaults,
  ValueWidget: valueGridDefaults,
  PieChartWidget: pieChartGridDefaults,
  BarChartWidget: barChartGridDefaults,
}
</script>
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed, inject, watch } from 'vue'
import { GridStack } from 'gridstack'
import { buildPropertySchema as buildIconValuePropertySchema } from '../metrics/IconValueWidget.vue'
import { buildPropertySchema as buildValuePropertySchema } from '../metrics/ValueWidget.vue'
import { buildPropertySchema as buildPieChartPropertySchema } from '../metrics/PieChartWidget.vue'
import { buildPropertySchema as buildBarChartPropertySchema } from '../metrics/BarChartWidget.vue'

/** Builds property schema for a widget by type (used after property change). */
function buildPropertySchemaForWidget(widget) {
  if (!widget) return null
  if (widget.type === 'IconValueWidget') return buildIconValuePropertySchema(widget)
  if (widget.type === 'ValueWidget') return buildValuePropertySchema(widget)
  if (widget.type === 'PieChartWidget') return buildPieChartPropertySchema(widget)
  if (widget.type === 'BarChartWidget') return buildBarChartPropertySchema(widget)
  return null
}

const props = defineProps({
  widgets: { type: Array, default: () => [] },
  /** Optional; overrides inject. Receives (propertySchema, opts?) where opts.update = (key, value) => void */
  openPropertyEditor: { type: Function, default: null },
  identifier: { type: String, default: '' },
  /** Optional: (index, key, value) => void – called when a child widget prop is updated */
  updateWidget: { type: Function, default: null },
  gridOptions: { type: Object, default: () => ({}) },
  widgetComponents: { type: Object, default: () => ALLOWED_CHILD_TYPES },
  gridDefaultsByType: { type: Object, default: () => DEFAULT_GRID_DEFAULTS_BY_TYPE },
  sizeMode: {
    type: String,
    default: 'computed',
    validator: (v) => ['auto', 'computed'].includes(v),
  },
  backgroundColor: { type: String, default: '' },
  foregroundColor: { type: String, default: '' },
  horizontalAlignment: { type: String, default: 'center', validator: (v) => ['start', 'center', 'end'].includes(v) },
  verticalAlignment: { type: String, default: 'start', validator: (v) => ['start', 'center', 'end'].includes(v) },
  contentHorizontalAlignment: { type: String, default: 'start', validator: (v) => ['start', 'center', 'end'].includes(v) },
  contentVerticalAlignment: { type: String, default: 'start', validator: (v) => ['start', 'center', 'end'].includes(v) },
  dock: { type: String, default: 'none', validator: (v) => ['none', 'top', 'left', 'right', 'bottom', 'fill'].includes(v) },
  /** Edit mode: shows grid overlay when true. */
  editMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:widgets'])

const gridEl = ref(null)
let grid = null
let overlayEl = null
let overlayWrapper = null
let resizeObserver = null
let mutationObserver = null
const isMounted = ref(false)
const LAYOUT_KEYS = ['type', 'x', 'y', 'w', 'h', 'minW', 'minH']

/** Only allowed child types from widgetComponents; any other type is not rendered as a grid item. */
const contentWidgetComponents = computed(() => {
  const allowed = Object.keys(ALLOWED_CHILD_TYPES)
  return Object.fromEntries(
    Object.entries(props.widgetComponents || {}).filter(([key]) => allowed.includes(key))
  )
})

const gridWidthPx = computed(() => {
  const col = props.gridOptions.column ?? 12
  const cellW = parseCellSize(props.gridOptions.cellWidth) ?? 120
  return col * cellW
})

function parseCellSize(val) {
  if (val == null) return null
  if (typeof val === 'number') return val
  const match = String(val).match(/^([\d.]+)\s*px$/i)
  return match ? Number(match[1]) : null
}

const gridContainerStyle = computed(() => {
  const rowCount = props.gridOptions.row
  const cellH = parseCellSize(props.gridOptions.cellHeight) ?? 80
  const margin = typeof props.gridOptions.margin === 'number' ? props.gridOptions.margin : 5
  const base = { overflow: 'hidden' }
  if (rowCount != null && rowCount > 0) {
    base.height = `${rowCount * cellH + (rowCount - 1) * margin}px`
  } else {
    base.height = '100vh'
  }
  if (props.sizeMode === 'auto') base.width = '100%'
  else base.width = gridWidthPx.value + 'px'
  if (props.backgroundColor) base.backgroundColor = props.backgroundColor
  if (props.foregroundColor) base.color = props.foregroundColor
  return base
})

const selfAlignmentStyle = computed(() => {
  const alignSelf = props.verticalAlignment === 'start' ? 'flex-start' : props.verticalAlignment === 'end' ? 'flex-end' : 'center'
  const margin = props.horizontalAlignment === 'start' ? {} : props.horizontalAlignment === 'end' ? { marginLeft: 'auto' } : { marginLeft: 'auto', marginRight: 'auto' }
  return { alignSelf, ...margin, width: '100%', minWidth: 0 }
})

const contentAlignmentWrapperStyle = computed(() => ({
  display: 'flex',
  justifyContent: props.contentHorizontalAlignment === 'start' ? 'flex-start' : props.contentHorizontalAlignment === 'end' ? 'flex-end' : 'center',
  alignItems: props.contentVerticalAlignment === 'start' ? 'flex-start' : props.contentVerticalAlignment === 'end' ? 'flex-end' : 'center',
  width: '100%',
  height: '100%',
  minHeight: '100%',
}))

function getLayout(w) {
  const defaults = props.gridDefaultsByType[w.type] ?? { w: 1, h: 1, minW: 1, minH: 1 }
  return {
    ...defaults,
    x: w.x,
    y: w.y,
    ...(w.w != null && { w: w.w }),
    ...(w.h != null && { h: w.h }),
    ...(w.minW != null && { minW: w.minW }),
    ...(w.minH != null && { minH: w.minH }),
  }
}

function getLayoutBindings(w) {
  const L = getLayout(w)
  return { 'gs-x': L.x, 'gs-y': L.y, 'gs-w': L.w, 'gs-h': L.h, 'gs-min-w': L.minW, 'gs-min-h': L.minH }
}

// PropertyGridWidget must be provided by parent view - use computed pattern like IconValueWidget
const injectedOpenPropertyEditor = inject('openPropertyEditor', null)
const openPropertyEditor = computed(() => props.openPropertyEditor ?? injectedOpenPropertyEditor)


function adoptNewWidgetInGrid() {
  if (!grid || !gridEl.value) return
  const items = gridEl.value.querySelectorAll('.grid-stack-item')
  const last = items[items.length - 1]
  if (last && !last.gridstackNode) {
    grid.makeWidget(last)
    updateSizeTooltips()
  }
}

// When widgets array grows (e.g. parent synced), adopt any new DOM nodes
watch(
  () => (props.widgets || []).length,
  (len, prevLen) => {
    if (isMounted.value && len > (prevLen ?? len) && grid) {
      nextTick(adoptNewWidgetInGrid)
    }
  }
)

function getWidgetProps(w, index) {
  const base = Object.fromEntries(Object.entries(w).filter(([key]) => !LAYOUT_KEYS.includes(key)))
  // Use computed openPropertyEditor (props or inject)
  const fn = openPropertyEditor.value
  if (fn) {
    if (props.updateWidget) {
      base.openPropertyEditor = (propertySchema) =>
        fn(propertySchema, {
          update: (key, value) => props.updateWidget(index, key, value),
          widgetIndex: index,
          refresh: () => buildPropertySchemaForWidget(props.widgets[index]),
        })
    } else {
      // Fallback: update by emitting new array if no updateWidget prop
      base.openPropertyEditor = (propertySchema) =>
        fn(propertySchema, {
          update: (key, value) => {
            const next = [...(props.widgets || [])]
            next[index] = { ...next[index], [key]: value }
            emit('update:widgets', next)
          },
          widgetIndex: index,
          refresh: () => buildPropertySchemaForWidget(props.widgets[index]),
        })
    }
  }
  return base
}

function updateSizeTooltips() {
  nextTick(() => {
    if (!gridEl.value || !grid) return
    const opts = grid.opts
    const cellW = parseCellSize(opts.cellWidth)
    const cellH = parseCellSize(opts.cellHeight)
    gridEl.value.querySelectorAll('.grid-stack-item').forEach((el) => {
      const node = el.gridstackNode
      if (node && cellW != null && cellH != null) el.setAttribute('title', `${Math.round(node.w * cellW)} × ${Math.round(node.h * cellH)} px`)
      else el.setAttribute('title', `${el.offsetWidth} × ${el.offsetHeight} px`)
    })
  })
}

function updateOverlaySize() {
  if (!overlayEl || !grid) return
  const cols = grid.getColumn?.() ?? grid.opts?.column ?? 12
  const cellH = parseCellSize(grid.opts?.cellHeight) ?? 80
  const margin = typeof grid.opts?.margin === 'number' ? grid.opts.margin : 5
  const rowCount = grid.opts?.row
  
  overlayEl.style.backgroundSize = `calc(100% / ${cols}) ${cellH}px`
  
  // Set wrapper height to clip overlay at configured row count
  // This prevents overlay from showing extra rows when the drag-and-drop grid expands the container
  if (overlayWrapper) {
    if (rowCount != null && rowCount > 0) {
      const maxHeight = rowCount * cellH + (rowCount - 1) * margin
      overlayWrapper.style.height = `${maxHeight}px`
      // Add bottom border to show last row's bottom edge
      updateOverlayGridlineColor()
    } else {
      overlayWrapper.style.height = '100%'
      updateOverlayGridlineColor()
    }
  }
}

function updateOverlayGridlineColor() {
  if (!overlayEl || !isMounted.value) return
  
  try {
    // Convert foregroundColor to rgba with 0.05 opacity for gridlines
    let finalColor = 'rgba(0, 0, 0, 0.05)' // Default
    
    if (props.foregroundColor) {
      const fgColor = props.foregroundColor.trim()
      
      // Handle hex colors (#RRGGBB or #RGB)
      if (fgColor.startsWith('#')) {
        const hex = fgColor.slice(1)
        if (hex.length === 6) {
          const r = parseInt(hex.substr(0, 2), 16)
          const g = parseInt(hex.substr(2, 2), 16)
          const b = parseInt(hex.substr(4, 2), 16)
          if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            finalColor = `rgba(${r}, ${g}, ${b}, 0.05)`
          }
        } else if (hex.length === 3) {
          const r = parseInt(hex[0] + hex[0], 16)
          const g = parseInt(hex[1] + hex[1], 16)
          const b = parseInt(hex[2] + hex[2], 16)
          if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            finalColor = `rgba(${r}, ${g}, ${b}, 0.05)`
          }
        }
      }
      // Handle rgb/rgba colors
      else if (fgColor.startsWith('rgb')) {
        const match = fgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (match) {
          finalColor = `rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.05)`
        }
      }
      // Handle named colors (fallback - try to use as-is with opacity)
      else {
        // For named colors, we'll use a CSS variable approach or default
        // For now, use default since we can't easily convert named colors
        finalColor = 'rgba(0, 0, 0, 0.05)'
      }
    }
    
    if (overlayEl) {
      overlayEl.style.backgroundImage = `
        linear-gradient(to right, ${finalColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${finalColor} 1px, transparent 1px)
      `
    }
    
    // Update border color for overlay wrapper if it exists
    if (overlayWrapper) {
      overlayWrapper.style.borderBottom = `1px solid ${finalColor}`
    }
  } catch (error) {
    console.warn('GridLayoutWidget: Error in updateOverlayGridlineColor:', error)
  }
}

function updateEmptyState() {
  if (!gridEl.value || !grid) return
  const isEmpty = (grid.engine?.nodes?.length ?? 0) === 0
  gridEl.value.classList.toggle('empty-grid', isEmpty)
}

function handleGridChange() {
  updateEmptyState()
  // Update overlay height in case the grid expanded the container
  updateOverlaySize()
}

onMounted(() => {
  if (!gridEl.value) return
  const opts = {
    column: props.gridOptions?.column ?? 12,
    maxColumn: props.gridOptions?.column ?? 12,
    row: props.gridOptions?.row ?? 12,
    maxRow: props.gridOptions?.row ?? 12,
    cellHeight: '80px',
    cellWidth: '120px',
    margin: 5,
    acceptWidgets: true,
    alwaysShowResizeHandle: true,
    float: true,
    draggable: { scroll: true, scrollSensitivity: 100, scrollSpeed: 10, preventOutline: true, preventOutlineOnDrag: true, preventOutlineOnDrop: true, preventOutlineOnScroll: true },
    ...props.gridOptions,
  }
  if (props.gridOptions?.row != null) opts.maxRow = opts.row
  grid = GridStack.init(opts, gridEl.value)
  grid.updateOptions({ acceptWidgets: (el) => (el.gridstackNode?.grid === grid) })
  updateSizeTooltips()
  grid.on('resizestop dragstop', updateSizeTooltips)
  
  // Create overlay wrapper and overlay element
  if (!gridEl.value.querySelector('.grid-overlay-wrapper')) {
    overlayWrapper = document.createElement('div')
    overlayWrapper.className = 'grid-overlay-wrapper'
    overlayWrapper.setAttribute('aria-hidden', 'true')
    
    overlayEl = document.createElement('div')
    overlayEl.className = 'grid-overlay'
    overlayEl.setAttribute('aria-hidden', 'true')
    
    overlayWrapper.appendChild(overlayEl)
    gridEl.value.prepend(overlayWrapper)
  } else {
    overlayWrapper = gridEl.value.querySelector('.grid-overlay-wrapper')
    overlayEl = overlayWrapper.querySelector('.grid-overlay')
  }
  
  // Update overlay gridline color based on foregroundColor
  updateOverlayGridlineColor()
  
  // Set initial edit-mode class
  if (props.editMode) {
    gridEl.value.classList.add('edit-mode')
  }
  
  // Wire grid library (GridStack) events
  grid.on('added removed change', handleGridChange)
  grid.on('dragstart', () => {
    gridEl.value?.classList.add('dragging')
    updateOverlaySize() // Re-clamp overlay when dragging starts
  })
  grid.on('dragstop', () => {
    gridEl.value?.classList.remove('dragging')
    updateOverlaySize() // Re-clamp overlay when dragging stops
  })
  
  // Initial updates
  updateOverlaySize()
  updateEmptyState()
  
  // Mark as mounted
  isMounted.value = true
  
  // Watch for container resize (important for auto-width mode)
  if (props.sizeMode === 'auto' && ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (props.editMode) {
        updateOverlaySize() // Ensure overlay height stays clamped
      }
    })
    resizeObserver.observe(gridEl.value)
  }
  
  // Watch for container height changes to clamp overlay (prevents extra row from showing)
  if (MutationObserver && gridEl.value) {
    mutationObserver = new MutationObserver(() => {
      if (props.editMode && overlayWrapper) {
        nextTick(() => {
          updateOverlaySize() // Re-clamp overlay height after DOM updates
        })
      }
    })
    mutationObserver.observe(gridEl.value, {
      attributes: true,
      attributeFilter: ['style'],
      childList: false,
      subtree: false
    })
  }
  
})

onBeforeUnmount(() => {
  isMounted.value = false
  if (grid) {
    grid.off('added removed change', handleGridChange)
    grid.off('dragstart')
    grid.off('dragstop')
    grid.off('resizestop dragstop', updateSizeTooltips)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }
  if (overlayWrapper && overlayWrapper.parentNode) {
    overlayWrapper.parentNode.removeChild(overlayWrapper)
    overlayWrapper = null
    overlayEl = null
  }
})

// Widget container click: open PropertyGridWidget for GridLayoutWidget itself (like IconValueWidget pattern)
// Merge gridOptions into a props-like object so schema shows current row/column/cellHeight/cellWidth
function buildPropertySchemaFromProps() {
  const merged = {
    ...props,
    rows: props.gridOptions?.row ?? props.rows ?? 12,
    columns: props.gridOptions?.column ?? props.columns ?? 12,
    cellHeight: props.gridOptions?.cellHeight ?? props.cellHeight ?? '70px',
    cellWidth: props.gridOptions?.cellWidth ?? props.cellWidth ?? '120px',
  }
  return buildPropertySchema(merged)
}

function onWidgetClick() {
  const fn = openPropertyEditor.value
  if (fn) fn(buildPropertySchemaFromProps())
}

// Watch editMode to toggle class
watch(() => props.editMode, (val) => {
  if (gridEl.value) gridEl.value.classList.toggle('edit-mode', val)
}, { immediate: true })

// Watch gridOptions changes to update overlay size and grid configuration
watch(() => [
  props.gridOptions?.column,
  props.gridOptions?.row,
  props.gridOptions?.cellHeight,
  props.gridOptions?.cellWidth,
  props.gridOptions?.margin,
], ([cols, rows, cellHeight, cellWidth, margin]) => {
  if (!isMounted.value || !grid || !overlayEl) return
  
  try {
    // Update grid column/row configuration
    if (cols != null && typeof grid.column === 'function') {
      grid.column(cols)
      if (typeof grid.maxColumn === 'function') {
        grid.maxColumn(cols)
      }
    }
    if (rows != null && grid.opts) {
      grid.opts.row = rows
      grid.opts.maxRow = rows
    }
    // Update cell dimensions so changes in property panel take effect
    if (cellHeight != null || cellWidth != null) {
      const opts = {}
      if (cellHeight != null) opts.cellHeight = cellHeight
      if (cellWidth != null) opts.cellWidth = cellWidth
      if (Object.keys(opts).length && typeof grid.updateOptions === 'function') {
        grid.updateOptions(opts)
      }
      if (grid.opts) {
        if (cellHeight != null) grid.opts.cellHeight = cellHeight
        if (cellWidth != null) grid.opts.cellWidth = cellWidth
      }
    }
    nextTick(() => {
      if (grid && overlayEl) {
        updateOverlaySize()
        updateOverlayGridlineColor()
        updateSizeTooltips()
      }
    })
  } catch (error) {
    console.warn('GridLayoutWidget: Error updating grid options:', error)
  }
}, { deep: true })

// Watch foregroundColor changes to update gridline color
watch(() => props.foregroundColor, () => {
  if (!isMounted.value || !overlayEl) return
  try {
    nextTick(() => {
      if (overlayEl) {
        updateOverlayGridlineColor()
      }
    })
  } catch (error) {
    console.warn('GridLayoutWidget: Error updating gridline color:', error)
  }
})
</script>

<template>
  <div
    class="dashboard-grid-widget-root"
    :style="selfAlignmentStyle"
    tabindex="0"
    @dblclick.stop="onWidgetClick"
    @keydown.enter.prevent="onWidgetClick"
  >
    <div class="dashboard-grid-widget-content-wrapper" :style="contentAlignmentWrapperStyle">
      <div
        ref="gridEl"
        class="grid-stack"
        :class="{ 'edit-mode': editMode }"
        :style="gridContainerStyle"
      >
        <div
          v-for="(w, i) in widgets"
          :key="i"
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
.dashboard-grid-widget-root {
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
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
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

</style>
