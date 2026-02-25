<script>
/** Default and minimum grid size for this widget. Used by the grid view when not specified. */
export const gridDefaults = { w: 2, h: 2, minW: 1, minH: 2 }

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: 'Scatter Chart',
  description: 'Displays a scatter chart for numeric x/y points.',
  icon: 'fa-solid fa-braille',
  group: 'Charts',
}

/** Full property metadata for ScatterChartWidget. */
export const PROP_SCHEMA = {
  identifier: { type: 'string', default: '', control: 'text', label: 'Identifier' },

  // Card title (shown above chart)
  title: { type: 'string', default: 'Scatter Chart', control: 'text', label: 'Title' },
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

  // Data: "x,y;x,y;..."
  points: {
    type: 'string',
    default: '0,10;1,20;2,15',
    control: 'text',
    label: 'Points (x,y; x,y; ...)',
  },

  // Appearance / behaviour
  pointBackgroundColor: {
    type: 'string',
    default: '#0d6efd',
    control: 'colorPure',
    label: 'Point Color',
  },
  pointRadius: {
    type: 'number',
    default: 4,
    control: 'number',
    label: 'Point Radius',
    min: 1,
    max: 20,
    step: 1,
  },

  // Legend
  legendDisplay: { type: 'boolean', default: true, control: 'switch', label: 'Show Legend' },
  legendPosition: {
    type: 'string',
    default: 'top',
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
  data: ['points'],
  legend: ['legendDisplay', 'legendPosition', 'legendFontColor', 'legendFontFamily', 'legendFontSize'],
  chart: ['pointBackgroundColor', 'pointRadius', 'tooltipsEnabled', 'fillCell', 'verticalAlignment', 'maintainAspectRatio'],
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
  const displayLabel = props.identifier || props.title || 'Scatter Chart'
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
    label: `ScatterChart: ${displayLabel}`,
    children,
  }
}
</script>

<script setup>
import { computed, inject } from 'vue'
import { Scatter } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale)

const props = defineProps({
  openPropertyEditor: { type: Function, default: null },
  editMode: { type: Boolean, default: false },
  identifier: { type: String, default: '' },

  title: { type: String, default: 'Scatter Chart' },
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

  points: { type: String, default: '0,10;1,20;2,15' },

  pointBackgroundColor: { type: String, default: '#0d6efd' },
  pointRadius: { type: [Number, String], default: 4 },

  legendDisplay: { type: [Boolean, String], default: true },
  legendPosition: { type: String, default: 'top' },
  legendFontColor: { type: String, default: '#6c757d' },
  legendFontFamily: { type: String, default: 'inherit' },
  legendFontSize: { type: [Number, String], default: 12 },
  tooltipsEnabled: { type: [Boolean, String], default: true },
  fillCell: { type: [Boolean, String], default: true },
  verticalAlignment: { type: String, default: 'center' },
  maintainAspectRatio: { type: [Boolean, String], default: false },
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

function parsePointsString(str) {
  return String(str || '')
    .split(';')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [xs, ys] = pair.split(',').map((s) => s.trim())
      const x = Number(xs)
      const y = Number(ys)
      if (Number.isNaN(x) || Number.isNaN(y)) return null
      return { x, y }
    })
    .filter((p) => p != null)
}

const parsedPoints = computed(() => parsePointsString(props.points))

const showTitleBool = computed(() => asBool(props.showTitle, true))
const maintainAspectRatioValue = computed(() => asBool(props.maintainAspectRatio, false))
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

const chartData = computed(() => ({
  datasets: [
    {
      label: props.title || 'Dataset',
      data: parsedPoints.value,
      backgroundColor: props.pointBackgroundColor || '#0d6efd',
      pointRadius: asNumber(props.pointRadius, 4),
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: maintainAspectRatioValue.value,
  maintainAspectRatio: asBool(props.maintainAspectRatio, false),
  plugins: {
    legend: {
      display: asBool(props.legendDisplay, true),
      position: props.legendPosition || 'top',
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
          v-if="showTitleBool && title && titleVerticalAlignment === 'top'"
          class="mb-2"
          :class="titleClass"
          :style="titleStyle"
        >
        {{ title }}
      </div>

        <div class="chart-wrap" :class="{ 'flex-grow-1': fillCellBool }" :style="selfAlignmentStyle">
        <Scatter
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

