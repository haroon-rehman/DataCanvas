<script>
/** Default and minimum grid size for this widget. Used by the grid view when not specified. */
export const gridDefaults = { w: 2, h: 2, minW: 1, minH: 2 }

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: 'Doughnut Chart',
  description: 'Displays a doughnut chart for categorical metrics.',
  icon: 'fa-solid fa-circle-notch',
  group: 'Charts',
}

/** Full property metadata for DoughnutChartWidget (doughnut‑chart focused). */
export const PROP_SCHEMA = {
  identifier: { type: 'string', default: '', control: 'text', label: 'Identifier' },

  // Card title (shown above chart)
  title: { type: 'string', default: 'Doughnut Chart', control: 'text', label: 'Title' },
  showTitle: { type: 'boolean', default: true, control: 'switch', label: 'Show Title' },
  titleFontColor: { type: 'string', default: '#6c757d', control: 'colorPure', label: 'Font color' },
  titleFontFamily: { type: 'string', default: 'inherit', control: 'font', label: 'Font family' },
  titleFontSize: {
    type: 'number',
    default: 14,
    control: 'number',
    label: 'Font Size (px)',
    min: 8,
    max: 72,
    step: 1,
  },
  titleVerticalAlignment: {
    type: 'string',
    default: 'top',
    control: 'select',
    options: ['top', 'bottom'],
    label: 'Vertical Alignment',
  },
  titleHorizontalAlignment: {
    type: 'string',
    default: 'center',
    control: 'select',
    options: ['left', 'center', 'right'],
    label: 'Horizontal Alignment',
  },

  // Data
  labels: {
    type: 'string',
    default: 'A,B,C',
    control: 'text',
    label: 'Labels (Comma Separated)',
  },
  values: {
    type: 'string',
    default: '40,30,30',
    control: 'text',
    label: 'Values (Comma Separated)',
  },
  colors: {
    type: 'string',
    default: '#0d6efd,#6c757d,#198754',
    control: 'text',
    label: 'Slice Colors (Comma Separated)',
  },

  // Appearance / behaviour
  sliceBorderWidth: {
    type: 'number',
    default: 0,
    control: 'number',
    label: 'Slice Border Width (px)',
    min: 0,
    max: 10,
    step: 1,
  },
  sliceBorderColor: { type: 'string', default: '', control: 'colorPure', label: 'Slice Border Color' },
  fillCell: {
    type: 'boolean',
    default: true,
    control: 'switch',
    label: 'Fill Cell',
  },
  verticalAlignment: {
    type: 'string',
    default: 'center',
    control: 'select',
    options: ['top', 'center', 'bottom'],
    label: 'Vertical Alignment',
  },
  maintainAspectRatio: {
    type: 'boolean',
    default: false,
    control: 'switch',
    label: 'Maintain Aspect Ratio',
  },

  // Legend
  legendDisplay: { type: 'boolean', default: true, control: 'switch', label: 'Show Legend' },
  legendPosition: {
    type: 'string',
    default: 'bottom',
    control: 'select',
    options: ['top', 'right', 'bottom', 'left'],
    label: 'Position',
  },
  legendFontColor: { type: 'string', default: '#6c757d', control: 'colorPure', label: 'Font color' },
  legendFontFamily: { type: 'string', default: 'inherit', control: 'font', label: 'Font family' },
  legendFontSize: {
    type: 'number',
    default: 12,
    control: 'number',
    label: 'Font Size (px)',
    min: 8,
    max: 32,
    step: 1,
  },

  tooltipsEnabled: { type: 'boolean', default: true, control: 'switch', label: 'Show Tooltips' },

  // Card visual + layout
  backgroundColor: { type: 'string', default: '', control: 'colorBoth', label: 'Background Color' },
  borderLeftColor: { type: 'string', default: 'orange', control: 'colorPure', label: 'Border Left' },
  borderTopColor: { type: 'string', default: '', control: 'colorPure', label: 'Border Top' },
  borderRightColor: { type: 'string', default: '', control: 'colorPure', label: 'Border Right' },
  borderBottomColor: { type: 'string', default: '', control: 'colorPure', label: 'Border Bottom' },
  cardPaddingAll: {
    type: 'number',
    default: 0.5,
    control: 'number',
    label: 'Padding All (rem)',
    min: 0.0,
    max: 5,
    step: 0.1,
  },
}

/** Prop names grouped by category. */
export const CONFIGURABLE_PROPS_BY_GROUP = {
  general: ['identifier', 'title'],
  title: [
    'showTitle',
    'titleFontColor',
    'titleFontFamily',
    'titleFontSize',
    'titleVerticalAlignment',
    'titleHorizontalAlignment',
  ],
  data: ['labels', 'values', 'colors'],
  legend: ['legendDisplay', 'legendPosition', 'legendFontColor', 'legendFontFamily', 'legendFontSize'],
  chart: ['sliceBorderWidth', 'sliceBorderColor', 'fillCell', 'verticalAlignment', 'maintainAspectRatio', 'tooltipsEnabled'],
  card: [
    'backgroundColor',
    'borderLeftColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'cardPaddingAll',
  ],
}

/** Builds property schema for PropertyGridWidget from widget props. */
export function buildPropertySchema(props = {}) {
  const displayLabel = props.identifier || props.title || 'Doughnut Chart'
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
    label: `DoughnutChart: ${displayLabel}`,
    children,
  }
}
</script>

<script setup>
import { computed, inject } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  openPropertyEditor: { type: Function, default: null },

  identifier: { type: String, default: '' },

  title: { type: String, default: 'Doughnut Chart' },
  titleFontColor: { type: String, default: '#6c757d' },
  titleFontFamily: { type: String, default: 'inherit' },
  titleFontSize: {
    type: [Number, String],
    default: 14,
  },
  showTitle: { type: [Boolean, String], default: true },
  titleVerticalAlignment: {
    type: String,
    default: 'top',
    validator: (v) => ['top', 'bottom'].includes(v),
  },
  titleHorizontalAlignment: {
    type: String,
    default: 'center',
    validator: (v) => ['left', 'center', 'right'].includes(v),
  },

  backgroundColor: { type: String, default: '' },
  borderLeftColor: { type: String, default: 'orange' },
  borderTopColor: { type: String, default: '' },
  borderRightColor: { type: String, default: '' },
  borderBottomColor: { type: String, default: '' },
  cardPaddingAll: { type: [Number, String], default: 0.5 },

  labels: { type: String, default: 'A,B,C' },
  values: { type: String, default: '40,30,30' },
  colors: { type: String, default: '#0d6efd,#6c757d,#198754' },

  sliceBorderWidth: { type: [Number, String], default: 0 },
  sliceBorderColor: { type: String, default: '' },
  fillCell: { type: [Boolean, String], default: true },
  verticalAlignment: {
    type: String,
    default: 'center',
    validator: (v) => ['top', 'center', 'bottom'].includes(v),
  },
  maintainAspectRatio: { type: [Boolean, String], default: false },

  legendDisplay: { type: [Boolean, String], default: true },
  legendPosition: { type: String, default: 'bottom' },
  legendFontColor: { type: String, default: '#6c757d' },
  legendFontFamily: { type: String, default: 'inherit' },
  legendFontSize: { type: [Number, String], default: 12 },
  tooltipsEnabled: { type: [Boolean, String], default: true },
})

const cardStyle = computed(() => {
  const style = {
    maxHeight: '100%',
    height: '100%',
    overflow: 'hidden',
    minHeight: 0,
  }

  if (props.backgroundColor) {
    const bg = props.backgroundColor.trim()
    if (/^linear-gradient\(|^radial-gradient\(/i.test(bg)) style.background = bg
    else style.backgroundColor = bg
  }

  const width = '3px solid '
  if (props.borderLeftColor) style.borderLeft = width + props.borderLeftColor
  if (props.borderTopColor) style.borderTop = width + props.borderTopColor
  if (props.borderRightColor) style.borderRight = width + props.borderRightColor
  if (props.borderBottomColor) style.borderBottom = width + props.borderBottomColor

  return style
})

const titleClass = computed(() => [])
const titleStyle = computed(() => {
  const s = {}
  if (props.titleFontFamily) s.fontFamily = props.titleFontFamily
  if (props.titleFontColor) s.color = props.titleFontColor

  s.fontSize = `${asNumber(props.titleFontSize, 14)}px`

  if (props.titleHorizontalAlignment === 'left') s.textAlign = 'left'
  else if (props.titleHorizontalAlignment === 'right') s.textAlign = 'right'
  else s.textAlign = 'center'

  s.width = '100%'

  return s
})

const selfAlignmentStyle = computed(() => ({
  alignSelf: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
}))

const contentAlignmentStyle = computed(() => {
  const vertical = props.verticalAlignment || 'center'
  let justifyContent = 'center'
  if (vertical === 'top') justifyContent = 'flex-start'
  else if (vertical === 'bottom') justifyContent = 'flex-end'

  return {
    justifyContent,
    alignItems: 'center',
    width: '100%',
    height: '100%',
    minHeight: 0,
    padding: `${Number(props.cardPaddingAll) || 0}rem`,
  }
})

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

const showTitleBool = computed(() => asBool(props.showTitle, true))
const maintainAspectRatioValue = computed(() => asBool(props.maintainAspectRatio, false))
const fillCellBool = computed(() => asBool(props.fillCell, false))
const legendFontSizeKey = computed(() => asNumber(props.legendFontSize, 12))

const injectedOpenPropertyEditor = inject('openPropertyEditor', null)
const openPropertyEditor = computed(() => props.openPropertyEditor ?? injectedOpenPropertyEditor)

function buildPropertySchemaFromProps() {
  return buildPropertySchema(props)
}

function onClick() {
  const fn = openPropertyEditor.value
  if (fn) fn(buildPropertySchemaFromProps())
}

function onKeydown(e) {
  if (!openPropertyEditor.value) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onClick()
  }
}

const chartData = computed(() => {
  const labels = parsedLabels.value
  const values = parsedValues.value
  if (!labels.length || !values.length) {
    return { labels: [], datasets: [] }
  }
  const dataValues = values.length === labels.length ? values : labels.map((_, i) => values[i] ?? 0)
  const colors = parsedColors.value
  const bgColors = dataValues.map((_, i) => colors[i] || '#0d6efd')

  return {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: bgColors,
        borderWidth: asNumber(props.sliceBorderWidth, 0),
        borderColor: props.sliceBorderColor || undefined,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: maintainAspectRatioValue.value,
  maintainAspectRatio: asBool(props.maintainAspectRatio, false),
  plugins: {
    legend: {
      display: asBool(props.legendDisplay, true),
      position: props.legendPosition || 'bottom',
      labels: {
        color: props.legendFontColor || undefined,
        font: {
          size: asNumber(props.legendFontSize, 12),
          family: props.legendFontFamily || undefined,
        },
      },
    },
    title: {
      display: false,
    },
    tooltip: { enabled: asBool(props.tooltipsEnabled, true) },
  },
}))
</script>

<template>
  <div
    class="card h-100 d-flex flex-column"
    :style="cardStyle"
    :role="openPropertyEditor ? 'button' : undefined"
    tabindex="0"
    @click="onClick"
    @keydown="onKeydown"
  >
    <div class="card-body d-flex flex-column" :style="contentAlignmentStyle">
        <div
          v-if="showTitleBool && title && titleVerticalAlignment === 'top'"
          class="mb-2"
          :class="titleClass"
          :style="titleStyle"
        >
        {{ title }}
      </div>

        <div class="chart-wrap" :class="{ 'flex-grow-1': fillCellBool }" :style="selfAlignmentStyle">
        <Doughnut
          :data="chartData"
          :options="chartOptions"
          :key="`${maintainAspectRatioValue ? 'ma-1' : 'ma-0'}-lfs-${legendFontSizeKey}`"
        />
      </div>

        <div
          v-if="showTitleBool && title && titleVerticalAlignment === 'bottom'"
          class="mt-2"
          :class="titleClass"
          :style="titleStyle"
        >
          {{ title }}
        </div>
    </div>
  </div>
</template>

<style scoped>
.card[role='button'] {
  cursor: pointer;
}

.chart-wrap {
  height: auto;
  max-height: 100%;
}
</style>

