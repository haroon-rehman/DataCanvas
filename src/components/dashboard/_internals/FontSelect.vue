<script setup>
import VSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { computed, inject } from 'vue'
import { useFontLoader } from '../../../composables/useFontLoader'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const { loadFont } = useFontLoader()

// Provided at bootstrap: { default: "...", fonts: [...] }
const fontConfig = inject('fontConfig', null)
if (!fontConfig) {
  throw new Error('fontConfig was not provided. Provide it in app bootstrap via app.provide("fontConfig", config).')
}

const options = computed(() => (fontConfig.fonts || []).filter((f) => f && f.name && f.stack))

const byStack = computed(() => {
  const map = new Map()
  for (const o of options.value) {
    map.set(o.stack, o)
  }
  return map
})

/**
 * Selected option object for vue-select.
 * - When modelValue is empty/'inherit'/'initial' → map to the default option
 * - Otherwise look up by stack; if missing, still fall back to default so the label is stable.
 */
const selectedOption = computed(() => {
  const v = props.modelValue
  const all = options.value
  if (!all.length) return null

  if (!v || v === 'inherit' || v === 'initial') {
    const byDefault = byStack.value.get(fontConfig.default)
    return byDefault ?? all[0]
  }

  return byStack.value.get(v) ?? byStack.value.get(fontConfig.default) ?? all[0]
})

function getOptionLabel(option) {
  if (!option) return ''
  return option.recommended ? `⭐ ${option.name}` : option.name
}

async function onUpdate(option) {
  const value = option?.stack ?? ''

  if (option?.url) {
    await loadFont(option.url)
  }

  // Apply (or reset) global font CSS variable
  document.documentElement.style.setProperty('--app-font', value || fontConfig.default)

  emit('update:modelValue', value)
}
</script>

<template>
  <VSelect
    :model-value="selectedOption"
    :options="options"
    :get-option-label="getOptionLabel"
    placeholder="Select font..."
    searchable
    clearable
    class="font-select"
    @update:modelValue="onUpdate"
  >
    <template #option="{ name, stack, recommended }">
      <span :style="{ fontFamily: stack }">
        <span v-if="recommended">⭐ </span>{{ name }}
      </span>
    </template>

    <template #selected-option="{ name, stack, recommended }">
      <span :style="{ fontFamily: stack }">
        <span v-if="recommended">⭐ </span>{{ name }}
      </span>
    </template>
  </VSelect>
</template>

<style scoped>
/* Match Bootstrap form-control-sm / form-select-sm height */
.font-select :deep(.v-select) {
  min-height: calc(1.5em + 0.5rem + calc(var(--bs-border-width, 1px) * 2));
}

.font-select :deep(.vs__dropdown-toggle) {
  padding: 0.25rem 0.5rem;
  min-height: calc(1.5em + 0.5rem + calc(var(--bs-border-width, 1px) * 2));
  font-size: 0.875rem;
  line-height: 1.5;
  min-width: 0;
}

.font-select :deep(.vs__search) {
  margin-top: 0;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.font-select :deep(.vs__selected) {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
