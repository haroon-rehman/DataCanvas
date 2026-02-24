<script setup>
/**
 * NewDashboardConfigOffcanvas — offcanvas to configure a new dashboard before initialization.
 * Collects: columns (max 12), rows (max 12), cellHeightPx, cellWidthPx, sizeMode.
 * Emits confirm with { column, row, cellHeightPx, cellWidthPx, sizeMode } or close on cancel.
 */
import { ref, watch } from 'vue'

const props = defineProps({
  /** Whether the offcanvas is visible. */
  show: { type: Boolean, default: false },
  /** Default column count. */
  defaultColumn: { type: Number, default: 12 },
  /** Default row count. */
  defaultRow: { type: Number, default: 6 },
  /** Default cell height in pixels. */
  defaultCellHeightPx: { type: Number, default: 70 },
  /** Default cell width in pixels. */
  defaultCellWidthPx: { type: Number, default: 120 },
  /** Default size mode: 'Auto' or 'Computed'. */
  defaultSizeMode: {
    type: String,
    default: "Computed",
    validator: (v) => ["Auto", "Computed"].includes(v),
  },
})

const emit = defineEmits(['close', 'confirm'])

const columns = ref(12)
const rows = ref(6)
const cellHeightPx = ref(70)
const cellWidthPx = ref(120)
const sizeMode = ref('Computed')

function resetForm() {
  columns.value = Math.min(12, Math.max(1, props.defaultColumn))
  rows.value = Math.min(12, Math.max(1, props.defaultRow))
  cellHeightPx.value = Math.max(1, Number(props.defaultCellHeightPx) || 70)
  cellWidthPx.value = Math.max(1, Number(props.defaultCellWidthPx) || 120)
  sizeMode.value = props.defaultSizeMode === 'Auto' ? 'Auto' : 'Computed'
}

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      resetForm()
    }
  },
  { immediate: true }
)

function handleConfirm() {
  const col = Math.min(12, Math.max(1, Number(columns.value) || 12))
  const row = Math.min(12, Math.max(1, Number(rows.value) || 6))
  const ch = Math.max(1, Number(cellHeightPx.value) || 70)
  const cw = Math.max(1, Number(cellWidthPx.value) || 120)
  const sm = sizeMode.value === 'Auto' ? 'Auto' : 'Computed'
  emit('confirm', {
    column: col,
    row,
    cellHeightPx: ch,
    cellWidthPx: cw,
    sizeMode: sm,
    margin: 5,
  })
  // Do NOT emit 'close' here — parent hides offcanvas and would reset gridOptions
}

function handleCancel() {
  emit('close')
}
</script>

<template>
  <div>
    <div
      class="offcanvas offcanvas-end shadow-lg new-dashboard-config-offcanvas"
      tabindex="-1"
      :class="{ show }"
      :aria-modal="show"
      aria-labelledby="new-dashboard-config-offcanvas-label"
      :style="show ? { visibility: 'visible', zIndex: 1060 } : { visibility: 'hidden' }"
      data-bs-scroll="true"
      data-bs-backdrop="false"
    >
      <div class="offcanvas-header border-bottom bg-body">
        <h5 id="new-dashboard-config-offcanvas-label" class="offcanvas-title fw-semibold mb-0">
          <i class="fa-solid fa-gear me-2 text-primary"></i>
          Dashboard Configuration
        </h5>
        <button type="button" class="btn-close" aria-label="Close" @click="handleCancel" />
      </div>
      <div class="offcanvas-body">
        <p class="text-muted small mb-3">
          Configure the grid layout for your new dashboard.
        </p>
        <div class="mb-3">
          <label for="config-columns" class="form-label">Columns (max 12)</label>
          <input
            id="config-columns"
            v-model.number="columns"
            type="number"
            class="form-control"
            min="1"
            max="12"
          />
        </div>
        <div class="mb-3">
          <label for="config-rows" class="form-label">Rows (max 12)</label>
          <input
            id="config-rows"
            v-model.number="rows"
            type="number"
            class="form-control"
            min="1"
            max="12"
          />
        </div>
        <div class="mb-3">
          <label for="config-cell-height" class="form-label">Cell Height (px)</label>
          <input
            id="config-cell-height"
            v-model.number="cellHeightPx"
            type="number"
            class="form-control"
            min="1"
            placeholder="70"
          />
        </div>
        <div class="mb-3">
          <label for="config-cell-width" class="form-label">Cell Width (px)</label>
          <input
            id="config-cell-width"
            v-model.number="cellWidthPx"
            type="number"
            class="form-control"
            min="1"
            placeholder="120"
          />
        </div>
        <div class="mb-3">
          <label for="config-size-mode" class="form-label">Size Mode</label>
          <select
            id="config-size-mode"
            v-model="sizeMode"
            class="form-select"
          >
            <option value="Computed">Computed (respect cell width/height)</option>
            <option value="Auto">Auto (fill container width)</option>
          </select>
        </div>
        <div class="d-flex gap-2 justify-content-end mt-4">
          <button type="button" class="btn btn-outline-secondary" @click="handleCancel">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="handleConfirm">
            Confirm
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="show"
      class="offcanvas-backdrop fade show new-dashboard-config-backdrop"
      style="z-index: 1059"
      @click="handleCancel"
    />
  </div>
</template>

<style scoped>
.new-dashboard-config-offcanvas {
  width: 400px;
}
.new-dashboard-config-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
