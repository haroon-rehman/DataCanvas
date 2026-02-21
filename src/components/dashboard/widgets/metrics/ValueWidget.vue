<script>
/** Default and minimum grid size for this widget. Used by the grid view when not specified. */
export const gridDefaults = { w: 1, h: 2, minW: 1, minH: 2 }

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: 'Value',
  description: 'Displays a label and value (e.g. metric or KPI) with configurable colors and fonts.',
  icon: 'fa-solid fa-hashtag',
  group: 'Metrics',
}

/** Full property metadata for ValueWidget. */
export const PROP_SCHEMA = {
  identifier: { type: 'string', default: '', control: 'text', label: 'Identifier' },
  label: { type: 'string', default: '', control: 'text', label: 'Label' },
  labelFontColor: { type: 'string', default: '#6c757d', control: 'colorPure', label: 'Label font color' },
  labelFontFamily: { type: 'string', default: 'inherit', control: 'font', label: 'Label font family' },
  labelFontSize: { type: 'string', default: 'small', control: 'select', options: ['small', 'fs-6', 'fs-5', 'fs-4', 'fs-3'], label: 'Label font size' },
  labelHorizontalAlignment: { type: 'string', default: 'start', control: 'select', options: ['start', 'center', 'end'], label: 'Label alignment' },
  backgroundColor: { type: 'string', default: '', control: 'colorBoth', label: 'Background color' },
  borderLeftColor: { type: 'string', default: 'orange', control: 'colorPure', label: 'Border left' },
  borderTopColor: { type: 'string', default: '', control: 'colorPure', label: 'Border top' },
  borderRightColor: { type: 'string', default: '', control: 'colorPure', label: 'Border right' },
  borderBottomColor: { type: 'string', default: '', control: 'colorPure', label: 'Border bottom' },
  cardPaddingAll: { type: 'number', default: 0.5, control: 'number', label: 'Padding all (rem)', min: 0.1, max: 5, step: 0.1 },
  value: { type: 'string', default: '--', control: 'text', label: 'Value' },
  valueFontColor: { type: 'string', default: 'inherit', control: 'colorPure', label: 'Value font color' },
  valueFontFamily: { type: 'string', default: 'inherit', control: 'font', label: 'Value font family' },
  valueFontSize: { type: 'string', default: 'fs-4', control: 'select', options: ['fs-1', 'fs-2', 'fs-3', 'fs-4', 'fs-5', 'fs-6'], label: 'Value font size' },
  valueHorizontalAlignment: { type: 'string', default: 'start', control: 'select', options: ['start', 'center', 'end'], label: 'Value alignment' },
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
  alignment: ['horizontalAlignment', 'verticalAlignment', 'contentHorizontalAlignment', 'contentVerticalAlignment'],
  label: ['label', 'labelFontColor', 'labelFontFamily', 'labelFontSize', 'labelHorizontalAlignment'],
  card: ['backgroundColor', 'borderLeftColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'cardPaddingAll'],
  value: ['value', 'valueFontColor', 'valueFontFamily', 'valueFontSize', 'valueHorizontalAlignment'],
}

/** Builds property schema for PropertyGridWidget from widget props. */
export function buildPropertySchema(props = {}) {
  const displayLabel = props.identifier || props.label || props.value || 'Value'
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
    label: `Value: ${displayLabel}`,
    children,
  }
}
</script>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  openPropertyEditor: { type: Function, default: null },
  identifier: { type: String, default: '' },
  value: { type: [String, Number], default: '--' },
  label: { type: String, default: '' },
  backgroundColor: { type: String, default: '' },
  borderLeftColor: { type: String, default: 'orange' },
  borderTopColor: { type: String, default: '' },
  borderRightColor: { type: String, default: '' },
  borderBottomColor: { type: String, default: '' },
  cardPaddingAll: { type: [Number, String], default: 0.5 },
  valueFontColor: { type: String, default: 'inherit' },
  valueFontFamily: { type: String, default: 'inherit' },
  valueFontSize: {
    type: String,
    default: 'fs-4',
    validator: (v) => ['fs-1', 'fs-2', 'fs-3', 'fs-4', 'fs-5', 'fs-6'].includes(v),
  },
  labelFontColor: { type: String, default: '#6c757d' },
  labelFontFamily: { type: String, default: 'inherit' },
  labelFontSize: {
    type: String,
    default: 'small',
    validator: (v) => ['small', 'fs-6', 'fs-5', 'fs-4', 'fs-3'].includes(v),
  },
  valueHorizontalAlignment: {
    type: String,
    default: 'start',
    validator: (v) => ['start', 'center', 'end'].includes(v),
  },
  labelHorizontalAlignment: {
    type: String,
    default: 'start',
    validator: (v) => ['start', 'center', 'end'].includes(v),
  },
  horizontalAlignment: {
    type: String,
    default: 'center',
    validator: (v) => ['start', 'center', 'end'].includes(v),
  },
  verticalAlignment: {
    type: String,
    default: 'start',
    validator: (v) => ['start', 'center', 'end'].includes(v),
  },
  contentHorizontalAlignment: {
    type: String,
    default: 'start',
    validator: (v) => ['start', 'center', 'end'].includes(v),
  },
  contentVerticalAlignment: {
    type: String,
    default: 'start',
    validator: (v) => ['start', 'center', 'end'].includes(v),
  },
  dock: {
    type: String,
    default: 'none',
    validator: (v) => ['none', 'top', 'left', 'right', 'bottom', 'fill'].includes(v),
  },
})

const bodyClasses = computed(() => ['card-body', 'd-flex', 'flex-column'])

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

const valueAlignmentClass = computed(() => `text-${props.valueHorizontalAlignment}`)
const labelAlignmentClass = computed(() => `text-${props.labelHorizontalAlignment}`)

const selfAlignmentStyle = computed(() => {
  const shouldFillWidth = props.horizontalAlignment === 'center'
  const alignSelf = props.verticalAlignment === 'start' ? 'flex-start' : props.verticalAlignment === 'end' ? 'flex-end' : 'center'
  const margin = props.horizontalAlignment === 'start' ? {} : props.horizontalAlignment === 'end' ? { marginLeft: 'auto' } : { marginLeft: 'auto', marginRight: 'auto' }
  return {
    alignSelf,
    ...margin,
    width: shouldFillWidth ? '100%' : 'auto',
    minWidth: 0,
    maxWidth: shouldFillWidth ? '100%' : 'none',
  }
})

const contentAlignmentStyle = computed(() => {
  const justifyContent = props.contentVerticalAlignment === 'start' ? 'flex-start' : props.contentVerticalAlignment === 'end' ? 'flex-end' : 'center'
  const alignItems = props.contentHorizontalAlignment === 'start' ? 'flex-start' : props.contentHorizontalAlignment === 'end' ? 'flex-end' : 'center'
  return {
    justifyContent,
    alignItems,
    width: '100%',
    height: '100%',
    minHeight: 0,
    padding: `${Number(props.cardPaddingAll) || 0.5}rem`,
  }
})

const valueStyle = computed(() => {
  const s = {}
  if (props.valueFontFamily) s.fontFamily = props.valueFontFamily
  if (props.valueFontColor) s.color = props.valueFontColor
  return s
})
const labelStyle = computed(() => {
  const s = {}
  if (props.labelFontFamily) s.fontFamily = props.labelFontFamily
  if (props.labelFontColor) s.color = props.labelFontColor
  return s
})

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
    :style="{ ...cardStyle, ...selfAlignmentStyle }"
    role="button"
    tabindex="0"
    @dblclick.stop="onClick"
    @keydown.enter.prevent="onClick"
  >
    <div :class="bodyClasses" :style="contentAlignmentStyle">
      <div class="d-flex flex-column min-w-0 flex-grow-1">
        <p class="value fw-bold mb-0" :class="[valueFontSize, valueAlignmentClass]" :style="valueStyle">{{ value }}</p>
        <p v-if="label" class="label text-muted mb-0" :class="[labelFontSize, labelAlignmentClass]" :style="labelStyle">{{ label }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card[role="button"] {
  cursor: pointer;
}
</style>
