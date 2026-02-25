<script>
/** Default and minimum grid size for this widget. Used by the grid view when not specified. */
export const gridDefaults = { w: 2, h: 2, minW: 1, minH: 2 }

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: 'Bar Chart',
  description: 'Displays a bar chart for categorical metrics.',
  icon: 'fa-solid fa-chart-column',
  group: 'Charts',
}

/** Full property metadata for BarChartWidget (bar‑chart focused). */
export const PROP_SCHEMA = {
  identifier: { type: 'string', default: '', control: 'text', label: 'Identifier' },

  // Card title (shown above chart)
  title: { type: 'string', default: 'Bar Chart', control: 'text', label: 'Title' },
  showTitle: { type: 'boolean', default: true, control: 'switch', label: 'Show Title' },
  titleFontColor: { type: 'string', default: '#6c757d', control: 'colorPure', label: 'Font Color' },
  titleFontFamily: { type: 'string', default: 'inherit', control: 'font', label: 'Font Family' },
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
    default: 'Top',
    control: 'select',
    options: ['Top', 'Bottom'],
    label: 'Vertical Alignment',
  },
  titleHorizontalAlignment: {
    type: 'string',
    default: 'Center',
    control: 'select',
    options: ['Left', 'Center', 'Right'],
    label: 'Horizontal Alignment',
  },

  // Bar data
  labels: {
    type: 'string',
    default: 'Jan,Feb,Mar',
    control: 'text',
    label: 'Labels (Comma Separated)',
  },
  values: {
    type: 'string',
    default: '10,20,30',
    control: 'text',
    label: 'Values (Comma Separated)',
  },
  barColor: {
    type: 'string',
    default: '#0d6efd',
    control: 'colorPure',
    label: 'Bar Color',
  },

  // Bar appearance / behaviour
  barBorderWidth: {
    type: 'number',
    default: 0,
    control: 'number',
    label: 'Bar Border Width (px)',
    min: 0,
    max: 10,
    step: 1,
  },
  barBorderColor: { type: 'string', default: '', control: 'colorPure', label: 'Bar Border Color' },
  indexAxis: {
    type: 'string',
    default: 'x',
    control: 'select',
    options: ['x', 'y'],
    label: 'Bar Orientation',
  },
  barPercentage: {
    type: 'number',
    default: 0.9,
    control: 'number',
    label: 'Bar Thickness (Relative)',
    min: 0.1,
    max: 1,
    step: 0.05,
  },
  categoryPercentage: {
    type: 'number',
    default: 0.8,
    control: 'number',
    label: 'Category Fill (Relative)',
    min: 0.1,
    max: 1,
    step: 0.05,
  },
  yBeginAtZero: { type: 'boolean', default: true, control: 'switch', label: 'Y Axis Begin at Zero' },
  yTicksShowAsThousands: {
    type: 'boolean',
    default: false,
    control: 'switch',
    label: 'Y Axis in Thousands (10k, 20k)',
  },
  fillCell: {
    type: 'boolean',
    default: true,
    control: 'switch',
    label: 'Fill Cell',
  },
  verticalAlignment: {
    type: 'string',
    default: 'Center',
    control: 'select',
    options: ['Top', 'Center', 'Bottom'],
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
    default: 'Top',
    control: 'select',
    options: ['Top', 'Right', 'Bottom', 'Left'],
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
  general: ['identifier',],
  title: [
    'title',
    'showTitle',
    'titleFontColor',
    'titleFontFamily',
    'titleFontSize',
    'titleVerticalAlignment',
    'titleHorizontalAlignment',
  ],
  data: ['labels', 'values', 'barColor'],
  legend: ['legendDisplay', 'legendPosition', 'legendFontColor', 'legendFontFamily', 'legendFontSize'],
  chart: [
    'barBorderWidth',
    'barBorderColor',
    'indexAxis',
    'barPercentage',
    'categoryPercentage',
    'yBeginAtZero',
    'yTicksShowAsThousands',
    'tooltipsEnabled',
    'fillCell',
    'verticalAlignment',
    'maintainAspectRatio',
  ],
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
import { computed, inject } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const props = defineProps({
  openPropertyEditor: { type: Function, default: null },
  editMode: { type: Boolean, default: false },
  identifier: { type: String, default: '' },

  title: { type: String, default: 'Bar Chart' },
  showTitle: { type: [Boolean, String], default: true },
  titleFontColor: { type: String, default: '#6c757d' },
  titleFontFamily: { type: String, default: 'inherit' },
  titleFontSize: {
    type: [Number, String],
    default: 14,
  },
  titleVerticalAlignment: {
    type: String,
    default: 'Top',
    validator: (v) => ['Top', 'Bottom'].includes(v),
  },
  titleHorizontalAlignment: {
    type: String,
    default: 'Center',
    validator: (v) => ['Left', 'Center', 'Right'].includes(v),
  },

  backgroundColor: { type: String, default: '' },
  borderLeftColor: { type: String, default: 'orange' },
  borderTopColor: { type: String, default: '' },
  borderRightColor: { type: String, default: '' },
  borderBottomColor: { type: String, default: '' },
  cardPaddingAll: { type: [Number, String], default: 0.5 },

  // Bar‑chart specific props
  labels: { type: String, default: 'Jan,Feb,Mar' },
  values: { type: String, default: '10,20,30' },
  barColor: { type: String, default: '#0d6efd' },

  barBorderWidth: { type: [Number, String], default: 0 },
  barBorderColor: { type: String, default: '' },
  indexAxis: { type: String, default: 'x' },
  barPercentage: { type: [Number, String], default: 0.9 },
  categoryPercentage: { type: [Number, String], default: 0.8 },
  yBeginAtZero: { type: [Boolean, String], default: true },
  yTicksShowAsThousands: { type: [Boolean, String], default: false },
  fillCell: { type: [Boolean, String], default: false },
  verticalAlignment: { type: String, default: 'Center' },
  maintainAspectRatio: { type: [Boolean, String], default: false },

  legendDisplay: { type: [Boolean, String], default: true },
  legendPosition: { type: String, default: 'Top' },
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

  if (props.titleHorizontalAlignment === 'Left') s.textAlign = 'Left'
  else if (props.titleHorizontalAlignment === 'Right') s.textAlign = 'Right'
  else s.textAlign = 'Center'

  s.width = '100%'

  return s
})

const selfAlignmentStyle = computed(() => ({
  alignSelf: 'Center',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
}))

const contentAlignmentStyle = computed(() => {
  const vertical = props.verticalAlignment || 'Center'
  let justifyContent = 'Center'
  if (vertical === 'Top') justifyContent = 'flex-start'
  else if (vertical === 'Bottom') justifyContent = 'flex-end'

  return {
    justifyContent,
    alignItems: 'Center',
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

const showTitleBool = computed(() => asBool(props.showTitle, true))
const maintainAspectRatioValue = computed(() => asBool(props.maintainAspectRatio, true))
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

  return {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: props.barColor || '#0d6efd',
        borderWidth: asNumber(props.barBorderWidth, 0),
        borderColor: props.barBorderColor || undefined,
        barPercentage: asNumber(props.barPercentage, 0.9),
        categoryPercentage: asNumber(props.categoryPercentage, 0.8),
      },
    ],
  }
})

const chartOptions = computed(() => ({
  indexAxis: props.indexAxis || 'x',
  responsive: true,
  maintainAspectRatio: maintainAspectRatioValue.value,
  scales: {
    y: {
      beginAtZero: asBool(props.yBeginAtZero, true),
      ticks: {
        callback: (value) => {
          const useThousands = asBool(props.yTicksShowAsThousands, false)
          if (!useThousands) return value
          const num = typeof value === 'number' ? value : Number(value)
          if (Number.isNaN(num)) return value
          return `${num / 1000}k`
        },
      },
    },
  },
  plugins: {
    legend: {
      display: asBool(props.legendDisplay, true),
      position: props.legendPosition || 'Top',
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
    :class="{ 'edit-mode': editMode }"
    :style="cardStyle"
    :role="openPropertyEditor ? 'button' : undefined"
    tabindex="0"
    @click="onClick"
    @keydown="onKeydown"
  >
      <div class="card-body d-flex flex-column" :style="contentAlignmentStyle">
        <div
          v-if="showTitleBool && title && titleVerticalAlignment === 'Top'"
          class="mb-2"
          :class="titleClass"
          :style="titleStyle"
        >
        {{ title }}
      </div>

        <div class="chart-wrap" :class="{ 'flex-grow-1': fillCellBool }" :style="selfAlignmentStyle">
        <Bar
          :data="chartData"
          :options="chartOptions"
          :key="`${maintainAspectRatioValue ? 'ma-1' : 'ma-0'}-lfs-${legendFontSizeKey}`"
        />
      </div>

        <div
          v-if="showTitleBool && title && titleVerticalAlignment === 'Bottom'"
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
  cursor: default;
}
.card[role='button'].edit-mode {
  cursor: pointer;
}

.chart-wrap {
  height: auto;
  max-height: 100%;
}
</style>