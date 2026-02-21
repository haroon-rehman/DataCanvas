<script setup>
import { ref, watch, computed } from 'vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

const DEFAULT_GRADIENT = 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)'

const props = defineProps({
  modelValue: { type: String, default: '' },
  /** Value to restore when Reset is clicked. When omitted, resets to modelValue. */
  originalValue: { type: String, default: undefined },
  /** Output format for solid: rgb, hex, hex6, hex8, hsl, hsv. Use hex8 or rgb when alpha is needed. */
  format: {
    type: String,
    default: 'hex8',
    validator: (v) => ['rgb', 'prgb', 'hex', 'hex6', 'hex3', 'hex4', 'hex8', 'name', 'hsl', 'hsv'].includes(v),
  },
  /** Allow gradient selection (Pure + Gradient tabs). When false, only solid colors. */
  allowGradient: { type: Boolean, default: false },
  /** Disable alpha channel */
  disableAlpha: { type: Boolean, default: false },
  /** Disable color history */
  disableHistory: { type: Boolean, default: false },
  /** Show picker open by default */
  defaultPopup: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

function isGradient(v) {
  if (!v || typeof v !== 'string') return false
  return /^linear-gradient\(|^radial-gradient\(/i.test(v.trim())
}

const pureValue = ref(normalizePureColor(props.modelValue))
const gradientValue = ref(isGradient(props.modelValue) ? props.modelValue.trim() : DEFAULT_GRADIENT)
const activeKey = ref(isGradient(props.modelValue) ? 'gradient' : 'pure')

watch(
  () => props.modelValue,
  (v) => {
    if (isGradient(v)) {
      gradientValue.value = v.trim()
      activeKey.value = 'gradient'
    } else {
      pureValue.value = normalizePureColor(v)
      activeKey.value = 'pure'
    }
  },
  { immediate: true },
)

function normalizePureColor(v) {
  if (v == null || v === '') return 'rgba(0,0,0,0)'
  if (typeof v !== 'string') return '#000000'
  const s = v.trim()
  if (isGradient(s)) return 'rgba(0,0,0,0)'
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i.test(s)) return s.length === 4 ? expandShortHex(s) : s
  if (/^#([0-9a-fA-F]{8})$/i.test(s)) return s
  if (/^rgba?\(/.test(s) || /^hsla?\(/.test(s)) return s
  const named = {
    orange: '#ffa500',
    steelblue: '#4682b4',
    coral: '#ff7f50',
    seagreen: '#2e8b57',
    inherit: '#888888',
    transparent: 'rgba(0,0,0,0)',
  }
  return named[s.toLowerCase()] ?? (s.startsWith('#') ? s : `#${s}`)
}

function expandShortHex(hex) {
  const r = hex[1] + hex[1],
    g = hex[2] + hex[2],
    b = hex[3] + hex[3]
  return `#${r}${g}${b}`
}

function onPureColorChange(val) {
  const str = typeof val === 'string' ? val : val?.toString?.() ?? String(val)
  pureValue.value = str
  emit('update:modelValue', str)
}

function onGradientColorChange(val) {
  const str = typeof val === 'string' ? val : String(val)
  gradientValue.value = str
  emit('update:modelValue', str)
}

function onActiveKeyChange(key) {
  activeKey.value = key
}

const resetValue = computed(() => props.originalValue !== undefined && props.originalValue !== null ? props.originalValue : props.modelValue)

function onReset() {
  const v = resetValue.value ?? ''
  if (isGradient(v)) {
    gradientValue.value = v.trim()
    activeKey.value = 'gradient'
    emit('update:modelValue', v.trim())
  } else {
    const normalized = normalizePureColor(v)
    pureValue.value = normalized
    activeKey.value = 'pure'
    emit('update:modelValue', normalized)
  }
}
</script>

<template>
  <ColorPicker
    :pure-color="pureValue"
    :gradient-color="allowGradient ? gradientValue : undefined"
    :active-key="allowGradient ? activeKey : 'pure'"
    :format="format"
    :disable-alpha="disableAlpha"
    :disable-history="disableHistory"
    :default-popup="defaultPopup"
    :use-type="allowGradient ? 'both' : 'pure'"
    shape="square"
    lang="En"
    @update:pure-color="onPureColorChange"
    @update:gradient-color="onGradientColorChange"
    @update:active-key="onActiveKeyChange"
  >
    <template #extra>
      <div class="btn-reset" @click="onReset">Reset</div>
    </template>
  </ColorPicker>
</template>

<style scoped>
.btn-reset {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--bs-secondary);
  background: transparent;
  border: 1px solid var(--bs-secondary);
  border-radius: 4px;
  text-align: center;
}

.btn-reset:hover {
  background: var(--bs-secondary);
  color: var(--bs-white);
}
</style>
