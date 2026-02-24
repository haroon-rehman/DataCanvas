<script setup>
/**
 * PropertyGridWidget — offcanvas panel that displays a list of properties as editable fields.
 * Used when a widget is selected: shows grouped rows (label/value + control type) and emits
 * updates. Expects propertySchema shape: { label?, children: [ { label, children: [ { key, label?, value, control?, options?, default? } ] } ] }.
 */
import { computed, reactive, ref, watch } from "vue";
import Colorpicker from "./ColorPicker.vue";
import FontSelect from "./FontSelect.vue";

const props = defineProps({
  /** Whether the offcanvas is visible. */
  show: { type: Boolean, default: false },
  /** Property schema: { label?, children: [ { label, children: [ leaf... ] } ] }. Leaf: key, label?, value, control?, options?, default?. */
  propertySchema: { type: Object, default: null },
  /** Optional callback when a property value changes: (key, value) => void. */
  onPropertyChange: { type: Function, default: null },
});

const emit = defineEmits(["close", "update"]);

/** Flatten properties into a list of editable rows (one per leaf with key). Used to drive the grid. */
function getEditableRows(data) {
  if (!data?.children?.length) return [];
  const rows = [];
  for (const group of data.children) {
    if (!group.children?.length) continue;
    for (const leaf of group.children) {
      if (leaf.key != null) {
        rows.push({
          groupLabel: group.label,
          key: leaf.key,
          label: leaf.label ?? leaf.key,
          value: leaf.value,
          type: leaf.type, // e.g. 'boolean', 'string', 'number'
          control: leaf.control ?? "text",
          options: leaf.options ?? null,
          default: leaf.default,
          min: leaf.min,
          max: leaf.max,
          step: leaf.step,
        });
      }
    }
  }
  return rows;
}

/** Display formatting for select option labels (without changing the underlying value). */
function formatSelectOptionLabel(opt) {
  if (opt == null || opt === "") return "(none)";
  if (typeof opt !== "string") return String(opt);

  // Only normalize the alignment words requested; do NOT title-case colors or other values.
  const map = {
    top: "Top",
    bottom: "Bottom",
    center: "Center",
    left: "Left",
    right: "Right",
  };
  return map[opt] ?? opt;
}

/**
 * Editable rows derived from propertySchema.
 *
 * Important: keep as a real reactive ref (not computed) so row.value mutations (e.g. from ColorPicker)
 * immediately update the UI without needing propertySchema to be rebuilt upstream.
 */
const editableRows = ref([]);
watch(
  () => props.propertySchema,
  (schema) => {
    editableRows.value = getEditableRows(schema).map((r) => reactive(r));
  },
  { immediate: true, deep: true },
);

/** Rows grouped by groupLabel for collapsible sections in the template. */
const groupedRows = computed(() => {
  const groups = [];
  let currentGroup = null;
  for (const row of editableRows.value) {
    if (!currentGroup || currentGroup.label !== row.groupLabel) {
      currentGroup = { label: row.groupLabel, rows: [] };
      groups.push(currentGroup);
    }
    currentGroup.rows.push(row);
  }
  return groups;
});

import { normalizeColorValue } from "../../../utils/colorUtils.js";

/** Format color for display: hex → uppercase, color names → title case, gradients unchanged. */
function formatColorForDisplay(value) {
  return value != null && value !== "" ? normalizeColorValue(value) : "";
}

/** Called when any control changes: update row for local display, call onPropertyChange, and emit. */
function handleInput(row, newValue) {
  let value = newValue;
  if (row.control === "colorPure" || row.control === "colorBoth") {
    value = normalizeColorValue(newValue) ?? newValue;
  } else if (row.control === "number" || row.type === "number") {
    const num = Number(newValue);
    value = Number.isNaN(num) ? (row.default ?? 0) : num;
  }
  row.value = value;
  // Defensive: ensure DOM updates even if a row value comes from a non-proxied object reference.
  editableRows.value = [...editableRows.value];
  if (props.onPropertyChange) props.onPropertyChange(row.key, value);
  emit("update", { key: row.key, value });
}

// Convert a string to title case
function toTitleCase(str) {
  // Split the string into an array of words
  const words = str.split(" ");

  // Map over the words array, capitalizing the first letter of each word
  const titleCasedWords = words.map((word) => {
    if (word.length > 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word; // Return empty string for extra spaces
  });

  // Join the words back together with a space
  return titleCasedWords.join(" ");
}
</script>

<template>
  <div class="property-grid-root">
    <!-- Offcanvas panel: visibility via .show class and visibility style so it hides when show=false -->
    <div
      class="offcanvas offcanvas-end shadow-lg property-grid-offcanvas"
      tabindex="-1"
      :class="{ show }"
      :aria-modal="show"
      aria-labelledby="property-grid-offcanvas-label"
      :style="
        show
          ? { visibility: 'visible', zIndex: 2000 }
          : { visibility: 'hidden' }
      "
    >
      <div class="offcanvas-header border-bottom bg-body">
        <h5
          id="property-grid-offcanvas-label"
          class="offcanvas-title fw-semibold mb-0"
        >
          <i class="fa-solid fa-sliders me-2 text-secondary"></i>
          {{ propertySchema?.label ?? "Properties" }}
        </h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="emit('close')"
        />
      </div>
      <div class="offcanvas-body p-0 overflow-auto">
        <!-- Has data: show grouped property sections with Bootstrap collapse -->
        <template v-if="propertySchema && groupedRows.length">
          <div class="property-sections">
            <div
              v-for="(group, gi) in groupedRows"
              :key="group.label"
              class="property-section"
            >
              <button
                type="button"
                class="property-section__header"
                data-bs-toggle="collapse"
                :data-bs-target="`#prop-collapse-${gi}`"
                aria-expanded="true"
                :aria-controls="`prop-collapse-${gi}`"
              >
                <span class="property-section__header-text">{{
                  group.label
                }}</span>
                <i
                  class="fa-solid fa-chevron-down property-section__chevron"
                  aria-hidden="true"
                ></i>
              </button>
              <div :id="`prop-collapse-${gi}`" class="collapse show">
                <div class="property-grid">
                  <div
                    v-for="row in group.rows"
                    :key="row.key"
                    class="property-grid-row"
                  >
                    <!-- Only set for attribute when there's an actual input/select element -->
                    <label
                      :for="
                        row.control === 'colorPure' ||
                        row.control === 'colorBoth' ||
                        row.control === 'font'
                          ? undefined
                          : `prop-${row.key}`
                      "
                      class="property-grid__label"
                    >
                      {{ row.label }}
                    </label>
                    <div class="property-grid__controls">
                      <!-- Control type: font | colorPure | colorBoth | select | number | boolean (switch) | text -->
                      <FontSelect
                        v-if="row.control === 'font'"
                        :model-value="row.value"
                        class="property-grid__font-select flex-grow-1"
                        @update:modelValue="(v) => handleInput(row, v)"
                      />
                      <!-- ColorPure: color picker with no gradient support -->
                      <template v-else-if="row.control === 'colorPure'">
                        <span class="small text-muted font-monospace">{{
                          formatColorForDisplay(row.value) || "(None)"
                        }}</span>
                        <Colorpicker
                          :model-value="row.value"
                          :original-value="row.default"
                          :allow-gradient="false"
                          @update:modelValue="(v) => handleInput(row, v)"
                        />
                      </template>
                      <!-- ColorBoth: color picker with gradient support -->
                      <template v-else-if="row.control === 'colorBoth'">
                        <span class="small text-muted font-monospace">{{
                          formatColorForDisplay(row.value) || "(None)"
                        }}</span>
                        <Colorpicker
                          :model-value="row.value"
                          :original-value="row.default"
                          :allow-gradient="true"
                          @update:modelValue="(v) => handleInput(row, v)"
                        />
                      </template>
                      <div
                        v-else-if="
                          row.type === 'boolean' || row.control === 'switch'
                        "
                        class="form-check form-switch"
                      >
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :id="`prop-${row.key}`"
                          :checked="row.value === true || row.value === 'true'"
                          @change="handleInput(row, $event.target.checked)"
                        />
                      </div>
                      <select
                        v-else-if="
                          row.control === 'select' && row.options?.length
                        "
                        :id="`prop-${row.key}`"
                        class="form-select form-select-sm flex-grow-1"
                        style="min-width: 0"
                        :value="row.value"
                        @change="handleInput(row, $event.target.value)"
                      >
                        <option
                          v-for="opt in row.options"
                          :key="opt"
                          :value="opt"
                        >
                          {{ formatSelectOptionLabel(opt) }}
                        </option>
                      </select>
                      <input
                        v-else-if="row.control === 'number'"
                        :id="`prop-${row.key}`"
                        type="number"
                        class="form-control form-control-sm flex-grow-1"
                        style="min-width: 0"
                        :min="row.min"
                        :max="row.max"
                        :step="row.step"
                        :value="row.value"
                        @input="handleInput(row, $event.target.value)"
                      />
                      <input
                        v-else
                        :id="`prop-${row.key}`"
                        type="text"
                        class="form-control form-control-sm flex-grow-1"
                        style="min-width: 0"
                        :value="row.value"
                        @input="handleInput(row, $event.target.value)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <!-- No data: empty state with close -->
        <div v-else class="text-center py-5 px-4">
          <i
            class="fa-solid fa-mouse-pointer fa-2x text-muted mb-3 d-block"
            style="opacity: 0.5"
          ></i>
          <p class="text-muted small mb-3">
            Double-click a widget to show and edit its properties.
          </p>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    <!-- Backdrop: only when open; click to close -->
    <div
      v-if="show"
      class="offcanvas-backdrop fade show property-grid-backdrop"
      style="z-index: 1999"
      @click="emit('close')"
    />
  </div>
</template>

<style scoped>
/* Two-column grid: label | control. minmax(0, 1fr) allows controls to shrink. */
.property-grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0 1rem;
  row-gap: 0;
  align-items: center;
  padding: 0.5rem 0;
}

.property-grid-row {
  /* Let children participate directly in the parent grid (label + controls as columns) */
  display: contents;
}

.property-sections {
  padding: 0;
}

/* Section = collapsible header + .collapse body; BEM-style __header, __label, __controls. */
.property-section {
  border-bottom: 1px solid var(--bs-border-color);
}

.property-section__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--bs-secondary-color);
  background-color: var(--bs-secondary-bg);
  border: none;
  border-bottom: 1px solid var(--bs-border-color);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
}

.property-section__header:hover {
  background-color: var(--bs-tertiary-bg);
}

.property-section__header:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--bs-primary);
}

.property-section__chevron {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.property-section__header:not(.collapsed) .property-section__chevron {
  transform: rotate(0deg);
}

.property-section__header.collapsed .property-section__chevron {
  transform: rotate(-90deg);
}

.property-section .collapse {
  padding: 0 1rem;
}

.property-grid__label {
  padding: 0.5rem 0;
  font-size: 0.875rem;
  margin: 0;
  min-width: 0;
}

.property-grid__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.5rem 0;
}

.property-grid__font-select {
  min-width: 0;
}

/* Ensure PropertyGridWidget appears above all other offcanvases */
.property-grid-offcanvas {
  z-index: 2000 !important;
}

.property-grid-backdrop {
  z-index: 1999 !important;
}
</style>
