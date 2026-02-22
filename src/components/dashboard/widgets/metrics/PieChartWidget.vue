<script>
/** Default and minimum grid size for this widget. Used by the grid view when not specified. */
export const gridDefaults = { w: 2, h: 2, minW: 2, minH: 2 }

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: 'Pie Chart',
  description: 'Displays a pie chart for categorical metrics.',
  icon: 'fa-solid fa-chart-pie',
  group: 'Charts',
}

/** Full property metadata for PieChartWidget. */
export const PROP_SCHEMA = {
  identifier: { type: 'string', default: '', control: 'text', label: 'Identifier' },
  title: { type: 'string', default: 'Pie Chart', control: 'text', label: 'Title' },
  labels: { type: 'string', default: 'A,B,C', control: 'text', label: 'Labels (comma separated)' },
  values: { type: 'string', default: '40,30,30', control: 'text', label: 'Values (comma separated)' },
  colors: { type: 'string', default: '#0d6efd,#6c757d,#198754', control: 'text', label: 'Slice colors (comma separated)' },
  sliceBorderWidth: { type: 'number', default: 0, control: 'number', label: 'Slice border width', min: 0, max: 10, step: 1 },
  sliceBorderColor: { type: 'string', default: '', control: 'colorPure', label: 'Slice border color' },
  responsive: { type: 'boolean', default: true, control: 'switch', label: 'Responsive' },
  maintainAspectRatio: { type: 'boolean', default: true, control: 'switch', label: 'Maintain aspect ratio' },
  legendDisplay: { type: 'boolean', default: false, control: 'switch', label: 'Show legend' },
  legendPosition: {
    type: 'string',
    default: 'bottom',
    control: 'select',
    options: ['top', 'right', 'bottom', 'left'],
    label: 'Legend position',
  },
  titlePosition: {
    type: 'string',
    default: 'top',
    control: 'select',
    options: ['top', 'right', 'bottom', 'left'],
    label: 'Title position',
  },
  titleFontSize: { type: 'number', default: 14, control: 'number', label: 'Title font size (px)', min: 8, max: 32, step: 1 },
  legendFontSize: { type: 'number', default: 12, control: 'number', label: 'Legend font size (px)', min: 8, max: 24, step: 1 },
  layoutPadding: { type: 'number', default: 0, control: 'number', label: 'Chart padding (px)', min: 0, max: 40, step: 2 },
  tooltipsEnabled: { type: 'boolean', default: true, control: 'switch', label: 'Show tooltips' },
  animationDuration: { type: 'number', default: 800, control: 'number', label: 'Animation duration (ms)', min: 0, max: 5000, step: 100 },
  animationEasing: {
    type: 'string',
    default: 'easeOutQuart',
    control: 'select',
    options: ['linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeOutQuart'],
    label: 'Animation easing',
  },
  animateScale: { type: 'boolean', default: true, control: 'switch', label: 'Animate scale' },
  animateRotate: { type: 'boolean', default: true, control: 'switch', label: 'Animate rotate' },
  transitionsActiveEnabled: { type: 'boolean', default: true, control: 'switch', label: 'Animate active state' },
  transitionsResizeEnabled: { type: 'boolean', default: true, control: 'switch', label: 'Animate resize' },
  backgroundColor: { type: 'string', default: '', control: 'colorBoth', label: 'Card background' },
  borderLeftColor: { type: 'string', default: '#0d6efd', control: 'colorPure', label: 'Border left' },
  borderTopColor: { type: 'string', default: '', control: 'colorPure', label: 'Border top' },
  borderRightColor: { type: 'string', default: '', control: 'colorPure', label: 'Border right' },
  borderBottomColor: { type: 'string', default: '', control: 'colorPure', label: 'Border bottom' },
  cardPaddingAll: { type: 'number', default: 0.5, control: 'number', label: 'Padding all (rem)', min: 0.1, max: 5, step: 0.1 },
}

/** Prop names grouped by category. */
const CONFIGURABLE_PROPS_BY_GROUP = {
  general: ['identifier', 'title'],
  data: ['labels', 'values', 'colors', 'sliceBorderWidth', 'sliceBorderColor'],
  chart: [
    'responsive',
    'maintainAspectRatio',
    'legendDisplay',
    'legendPosition',
    'titlePosition',
    'titleFontSize',
    'legendFontSize',
    'layoutPadding',
    'tooltipsEnabled',
    'animationDuration',
    'animationEasing',
    'animateScale',
    'animateRotate',
    'transitionsActiveEnabled',
    'transitionsResizeEnabled',
  ],
  card: ['backgroundColor', 'borderLeftColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'cardPaddingAll'],
}

/** Builds property schema for PropertyGridWidget from widget props. */
export function buildPropertySchema(props = {}) {
  const displayLabel = props.identifier || props.title || 'Pie Chart'
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
          min: schema.min,
          max: schema.max,
          step: schema.step,
          children: [],
        }
      }),
  }))
  return {
    label: `PieChart: ${displayLabel}`,
    children,
  }
}
</script>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  openPropertyEditor: { type: Function, default: null },
  identifier: { type: String, default: '' },
  title: { type: String, default: 'Pie Chart' },
  labels: { type: String, default: 'A,B,C' },
  values: { type: String, default: '40,30,30' },
  colors: { type: String, default: '#0d6efd,#6c757d,#198754' },
  sliceBorderWidth: { type: [Number, String], default: 0 },
  sliceBorderColor: { type: String, default: '' },
  responsive: { type: [Boolean, String], default: true },
  maintainAspectRatio: { type: [Boolean, String], default: true },
  legendDisplay: { type: [Boolean, String], default: false },
  legendPosition: { type: String, default: 'bottom' },
  titlePosition: { type: String, default: 'top' },
  titleFontSize: { type: [Number, String], default: 14 },
  legendFontSize: { type: [Number, String], default: 12 },
  layoutPadding: { type: [Number, String], default: 0 },
  tooltipsEnabled: { type: [Boolean, String], default: true },
  animationDuration: { type: [Number, String], default: 800 },
  animationEasing: { type: String, default: 'easeOutQuart' },
  animateScale: { type: [Boolean, String], default: true },
  animateRotate: { type: [Boolean, String], default: true },
  transitionsActiveEnabled: { type: [Boolean, String], default: true },
  transitionsResizeEnabled: { type: [Boolean, String], default: true },
  backgroundColor: { type: String, default: '' },
  borderLeftColor: { type: String, default: '#0d6efd' },
  borderTopColor: { type: String, default: '' },
  borderRightColor: { type: String, default: '' },
  borderBottomColor: { type: String, default: '' },
  cardPaddingAll: { type: [Number, String], default: 0.5 },
})

const canvasRef = ref(null)
let chartInstance = null
let resizeObserver = null

const parsedLabels = computed(() =>
  String(props.labels || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
)

const parsedValues = computed(() =>
  String(props.values || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n)),
)

const parsedColors = computed(() =>
  String(props.colors || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
)

const cardStyle = computed(() => {
  const style = {
    maxHeight: '100%',
    overflow: 'hidden',
    minHeight: 0,
  }
  if (props.backgroundColor) {
    if (/^linear-gradient\(|^radial-gradient\(/i.test(props.backgroundColor.trim())) {
      style.background = props.backgroundColor
    } else {
      style.backgroundColor = props.backgroundColor
    }
  }
  const width = '3px solid '
  if (props.borderLeftColor) style.borderLeft = width + props.borderLeftColor
  if (props.borderTopColor) style.borderTop = width + props.borderTopColor
  if (props.borderRightColor) style.borderRight = width + props.borderRightColor
  if (props.borderBottomColor) style.borderBottom = width + props.borderBottomColor
  return style
})

const bodyStyle = computed(() => ({
  padding: `${Number(props.cardPaddingAll) || 0.5}rem`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'stretch',
}))

const asBool = (v, fallback = false) => {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const lower = v.toLowerCase().trim()
    if (lower === 'true') return true
    if (lower === 'false') return false
  }
  return fallback
}

const asNumber = (v, fallback = 0) => {
  if (typeof v === 'number') return v
  const n = Number(v)
  return Number.isNaN(n) ? fallback : n
}

function ensureChart() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  const labels = parsedLabels.value
  const values = parsedValues.value
  if (!labels.length || !values.length) return
  const dataValues = values.length === labels.length ? values : labels.map((_, i) => values[i] ?? 0)
  const colors = parsedColors.value
  const bgColors = dataValues.map((_, i) => colors[i] || '#0d6efd')

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const duration = asNumber(props.animationDuration, 800)
  const easing = String(props.animationEasing || 'easeOutQuart')

  const padding = asNumber(props.layoutPadding, 0) + 2

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: bgColors,
          borderWidth: asNumber(props.sliceBorderWidth, 0),
          borderColor: props.sliceBorderColor || undefined,
        },
      ],
    },
    options: {
      responsive: asBool(props.responsive, true),
      // Let us fully control the canvas size when "maintainAspectRatio" is enabled
      // so the pie always fits inside the card without clipping.
      maintainAspectRatio: false,
      animation: {
        duration,
        easing,
        animateScale: asBool(props.animateScale, true),
        animateRotate: asBool(props.animateRotate, true),
      },
      aspectRatio: 1,
      layout: {
        padding,
      },
      plugins: {
        legend: {
          display: asBool(props.legendDisplay, false),
          position: props.legendPosition || 'bottom',
          labels: {
            boxWidth: 12,
            font: {
              size: asNumber(props.legendFontSize, 12),
            },
          },
        },
        title: {
          display: !!props.title,
          text: props.title,
          position: props.titlePosition || 'top',
          font: {
            size: asNumber(props.titleFontSize, 14),
          },
        },
        tooltip: {
          enabled: asBool(props.tooltipsEnabled, true),
        },
      },
      transitions: {
        active: {
          animation: {
            duration: asBool(props.transitionsActiveEnabled, true) ? duration : 0,
            easing,
          },
        },
        resize: {
          animation: {
            duration: asBool(props.transitionsResizeEnabled, true) ? duration : 0,
            easing,
          },
        },
      },
    },
  })
}

onMounted(() => {
  ensureChart()
  if (canvasRef.value && typeof ResizeObserver !== 'undefined') {
    const el = canvasRef.value.closest('.card') || canvasRef.value.parentElement || canvasRef.value
    resizeObserver = new ResizeObserver(() => {
      // Debug: log card, container, and canvas sizes whenever the observed element resizes
      const cardEl = el instanceof Element ? el : canvasRef.value?.closest('.card')
      const containerEl = canvasRef.value?.parentElement
      const cardRect = cardEl?.getBoundingClientRect()
      const containerRect = containerEl?.getBoundingClientRect()
      const canvasRect = canvasRef.value?.getBoundingClientRect()
      if (cardRect && containerRect && canvasRect) {
        // eslint-disable-next-line no-console
        console.log('[PieChartWidget] resize', {
          card: { width: cardRect.width, height: cardRect.height },
          container: { width: containerRect.width, height: containerRect.height },
          canvas: { width: canvasRect.width, height: canvasRect.height },
        })
        // When maintainAspectRatio is true, constrain the canvas to stay fully inside the inner container.
        if (asBool(props.maintainAspectRatio, true) && canvasRef.value) {
          const side = Math.min(containerRect.width, containerRect.height)
          canvasRef.value.style.width = `${side}px`
          canvasRef.value.style.height = `${side}px`
          if (chartInstance) {
            chartInstance.resize()
          }
          return
        }
      }
      if (chartInstance) {
        chartInstance.resize()
      }
    })
    resizeObserver.observe(el)
  }
  // In some cases the initial Chart.js layout runs before the card has its final size.
  // Force a resize on the next frame so the pie chart fits inside the card body.
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => {
      const containerEl = canvasRef.value?.parentElement
      const containerRect = containerEl?.getBoundingClientRect()
      if (containerRect && asBool(props.maintainAspectRatio, true) && canvasRef.value) {
        const side = Math.min(containerRect.width, containerRect.height)
        canvasRef.value.style.width = `${side}px`
        canvasRef.value.style.height = `${side}px`
      }
      if (chartInstance) {
        chartInstance.resize()
      }
    })
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

onUpdated(() => {
  // When the parent layout changes (e.g. rows/columns added/removed), Vue may
  // re-render this component even if the element size change isn't large enough
  // to trigger ResizeObserver. As a safety net, recompute the canvas square and
  // ask Chart.js to resize.
  if (!canvasRef.value || !chartInstance) return
  const containerEl = canvasRef.value.parentElement
  const containerRect = containerEl?.getBoundingClientRect()
  if (containerRect && asBool(props.maintainAspectRatio, true)) {
    const side = Math.min(containerRect.width, containerRect.height)
    canvasRef.value.style.width = `${side}px`
    canvasRef.value.style.height = `${side}px`
  }
  chartInstance.resize()
})

watch(
  () => [
    props.title,
    parsedLabels.value,
    parsedValues.value,
    parsedColors.value,
    props.responsive,
    props.sliceBorderWidth,
    props.sliceBorderColor,
    props.maintainAspectRatio,
    props.legendDisplay,
    props.legendPosition,
    props.titlePosition,
    props.titleFontSize,
    props.legendFontSize,
    props.layoutPadding,
    props.tooltipsEnabled,
    props.animationDuration,
    props.animationEasing,
    props.animateScale,
    props.animateRotate,
    props.transitionsActiveEnabled,
    props.transitionsResizeEnabled,
  ],
  () => {
    ensureChart()
  },
)

const injectedOpenPropertyEditor = inject('openPropertyEditor', null)
const openPropertyEditor = computed(() => props.openPropertyEditor ?? injectedOpenPropertyEditor)

function buildPropertySchemaFromProps() {
  return buildPropertySchema(props)
}

function onClick() {
  const fn = openPropertyEditor.value
  if (fn) fn(buildPropertySchemaFromProps())
}
</script>

<template>
  <div
    class="card h-100"
    :style="cardStyle"
    role="button"
    tabindex="0"
    @dblclick.stop="onClick"
    @keydown.enter.prevent="onClick"
  >
    <div class="card-body d-flex flex-column" :style="bodyStyle">
      <div class="flex-grow-1 min-vh-0" style="min-height: 0; position: relative;">
        <canvas ref="canvasRef" style="width: 100%; height: auto; display: block;" />
      </div>
    </div>
  </div>
</template>
