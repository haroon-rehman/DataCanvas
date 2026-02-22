<script>
/** Default and minimum grid size for this widget. Used by the grid view when not specified. */
export const gridDefaults = { w: 2, h: 2, minW: 2, minH: 2 }

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: 'Bar Chart',
  description: 'Displays a bar chart for categorical metrics.',
  icon: 'fa-solid fa-chart-column',
  group: 'Charts',
}

/** Full property metadata for BarChartWidget. */
export const PROP_SCHEMA = {
  identifier: { type: 'string', default: '', control: 'text', label: 'Identifier' },
  title: { type: 'string', default: 'Bar Chart', control: 'text', label: 'Title' },
  labels: { type: 'string', default: 'Jan,Feb,Mar', control: 'text', label: 'Labels (comma separated)' },
  values: { type: 'string', default: '10,20,30', control: 'text', label: 'Values (comma separated)' },
  color: { type: 'string', default: '#0d6efd', control: 'colorPure', label: 'Bar color' },
  borderWidth: { type: 'number', default: 0, control: 'number', label: 'Bar border width', min: 0, max: 10, step: 1 },
  borderColor: { type: 'string', default: '', control: 'colorPure', label: 'Bar border color' },
  responsive: { type: 'boolean', default: true, control: 'switch', label: 'Responsive' },
  maintainAspectRatio: { type: 'boolean', default: true, control: 'switch', label: 'Maintain aspect ratio' },
  legendDisplay: { type: 'boolean', default: true, control: 'switch', label: 'Show legend' },
  legendPosition: {
    type: 'string',
    default: 'top',
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
  indexAxis: {
    type: 'string',
    default: 'x',
    control: 'select',
    options: ['x', 'y'],
    label: 'Bar orientation',
  },
  barPercentage: {
    type: 'number',
    default: 0.9,
    control: 'number',
    label: 'Bar thickness (relative)',
    min: 0.1,
    max: 1,
    step: 0.05,
  },
  categoryPercentage: {
    type: 'number',
    default: 0.8,
    control: 'number',
    label: 'Category fill (relative)',
    min: 0.1,
    max: 1,
    step: 0.05,
  },
  yTicksShowAsThousands: {
    type: 'boolean',
    default: false,
    control: 'switch',
    label: 'Y axis in thousands (10k, 20k)',
  },
  animationDuration: { type: 'number', default: 800, control: 'number', label: 'Animation duration (ms)', min: 0, max: 5000, step: 100 },
  animationEasing: {
    type: 'string',
    default: 'easeOutQuart',
    control: 'select',
    options: ['linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeOutQuart'],
    label: 'Animation easing',
  },
  animateX: { type: 'boolean', default: true, control: 'switch', label: 'Animate X axis' },
  animateY: { type: 'boolean', default: true, control: 'switch', label: 'Animate Y axis' },
  transitionsActiveEnabled: { type: 'boolean', default: true, control: 'switch', label: 'Animate active state' },
  transitionsResizeEnabled: { type: 'boolean', default: true, control: 'switch', label: 'Animate resize' },
  xTicksAutoSkip: { type: 'boolean', default: true, control: 'text', label: 'X ticks auto-skip (true/false)' },
  xTicksMaxRotation: { type: 'number', default: 0, control: 'number', label: 'X ticks max rotation', min: 0, max: 90, step: 5 },
  yBeginAtZero: { type: 'boolean', default: true, control: 'text', label: 'Y axis begin at zero (true/false)' },
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
  data: ['labels', 'values', 'color', 'borderWidth', 'borderColor'],
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
    'indexAxis',
    'barPercentage',
    'categoryPercentage',
    'xTicksAutoSkip',
    'xTicksMaxRotation',
    'yBeginAtZero',
    'yTicksShowAsThousands',
    'animationDuration',
    'animationEasing',
    'animateX',
    'animateY',
    'transitionsActiveEnabled',
    'transitionsResizeEnabled',
  ],
  card: ['backgroundColor', 'borderLeftColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'cardPaddingAll'],
}

/** Builds property schema for PropertyGridWidget from widget props. */
export function buildPropertySchema(props = {}) {
  const displayLabel = props.identifier || props.title || 'Bar Chart'
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
    label: `BarChart: ${displayLabel}`,
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
  title: { type: String, default: 'Bar Chart' },
  labels: { type: String, default: 'Jan,Feb,Mar' },
  values: { type: String, default: '10,20,30' },
  color: { type: String, default: '#0d6efd' },
  borderWidth: { type: [Number, String], default: 0 },
  borderColor: { type: String, default: '' },
  responsive: { type: [Boolean, String], default: true },
  maintainAspectRatio: { type: [Boolean, String], default: true },
  legendDisplay: { type: [Boolean, String], default: true },
  legendPosition: { type: String, default: 'top' },
  titlePosition: { type: String, default: 'top' },
  titleFontSize: { type: [Number, String], default: 14 },
  legendFontSize: { type: [Number, String], default: 12 },
  layoutPadding: { type: [Number, String], default: 0 },
  tooltipsEnabled: { type: [Boolean, String], default: true },
  indexAxis: { type: String, default: 'x' },
  barPercentage: { type: [Number, String], default: 0.9 },
  categoryPercentage: { type: [Number, String], default: 0.8 },
  xTicksAutoSkip: { type: [Boolean, String], default: true },
  xTicksMaxRotation: { type: [Number, String], default: 0 },
  yBeginAtZero: { type: [Boolean, String], default: true },
  yTicksShowAsThousands: { type: [Boolean, String], default: false },
  animationDuration: { type: [Number, String], default: 800 },
  animationEasing: { type: String, default: 'easeOutQuart' },
  animateX: { type: [Boolean, String], default: true },
  animateY: { type: [Boolean, String], default: true },
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

function ensureChart() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  const labels = parsedLabels.value
  const values = parsedValues.value
  if (!labels.length || !values.length) return
  const dataValues = values.length === labels.length ? values : labels.map((_, i) => values[i] ?? 0)

  // Coerce boolean-like and numeric-like props coming from the property grid
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

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const duration = asNumber(props.animationDuration, 800)
  const easing = String(props.animationEasing || 'easeOutQuart')

  const padding = asNumber(props.layoutPadding, 0) + 2

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: props.color || '#0d6efd',
          borderWidth: asNumber(props.borderWidth, 0),
          borderColor: props.borderColor || undefined,
          barPercentage: asNumber(props.barPercentage, 0.9),
          categoryPercentage: asNumber(props.categoryPercentage, 0.8),
        },
      ],
    },
    options: {
      indexAxis: props.indexAxis || 'x',
      responsive: asBool(props.responsive, true),
      maintainAspectRatio: asBool(props.maintainAspectRatio, true),
      animation: {
        duration,
        easing,
      },
      animations: {
        x: asBool(props.animateX, true)
          ? { duration, easing }
          : { duration: 0 },
        y: asBool(props.animateY, true)
          ? { duration, easing }
          : { duration: 0 },
      },
      layout: {
        padding,
      },
      plugins: {
        legend: {
          display: asBool(props.legendDisplay, true),
          position: props.legendPosition || 'top',
          labels: {
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
      scales: {
        x: {
          ticks: {
            autoSkip: asBool(props.xTicksAutoSkip, true),
            maxRotation: asNumber(props.xTicksMaxRotation, 0),
          },
        },
        y: {
          beginAtZero: asBool(props.yBeginAtZero, true),
          ticks: {
            callback: (value) => {
              const useThousands = asBool(props.yTicksShowAsThousands, false)
              if (useThousands) {
                const num = typeof value === 'number' ? value : Number(value)
                if (Number.isNaN(num)) return value
                return `${num / 1000}k`
              }
              return value
            },
          },
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
      // Debug: log card and canvas sizes whenever the observed element resizes
      const cardEl = el instanceof Element ? el : canvasRef.value?.closest('.card')
      const cardRect = cardEl?.getBoundingClientRect()
      const canvasRect = canvasRef.value?.getBoundingClientRect()
      if (cardRect && canvasRect) {
        // eslint-disable-next-line no-console
        console.log('[BarChartWidget] resize', {
          card: { width: cardRect.width, height: cardRect.height },
          canvas: { width: canvasRect.width, height: canvasRect.height },
        })
      }
      if (chartInstance) {
        chartInstance.resize()
      }
    })
    resizeObserver.observe(el)
  }
  // Ensure the bar chart re-measures after the card has its final layout.
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => {
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
  // Safety net: when the parent layout changes (rows/columns added/removed),
  // Vue may re-render this component even if the element size delta is small.
  // Force Chart.js to re-measure and redraw.
  if (!canvasRef.value || !chartInstance) return
  chartInstance.resize()
})

watch(
  () => [
    props.title,
    parsedLabels.value,
    parsedValues.value,
    props.responsive,
    props.color,
    props.borderWidth,
    props.borderColor,
    props.maintainAspectRatio,
    props.legendDisplay,
    props.legendPosition,
    props.titlePosition,
    props.titleFontSize,
    props.legendFontSize,
    props.layoutPadding,
    props.tooltipsEnabled,
    props.indexAxis,
    props.barPercentage,
    props.categoryPercentage,
    props.xTicksAutoSkip,
    props.xTicksMaxRotation,
    props.yBeginAtZero,
    props.yTicksShowAsThousands,
    props.animationDuration,
    props.animationEasing,
    props.animateX,
    props.animateY,
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
      <div class="flex-grow-1 min-vh-0" style="min-height: 0; position: relative; width: 100%; height: 100%;">
        <canvas ref="canvasRef" style="width: 100%; display: block;" />
      </div>
    </div>
  </div>
</template>

