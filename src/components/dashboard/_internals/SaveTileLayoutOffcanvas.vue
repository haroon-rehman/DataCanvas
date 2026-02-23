<script setup>
/**
 * SaveTileLayoutOffcanvas — reusable offcanvas dialog for saving a tile layout configuration.
 * Collects layout label (required), description (optional), auto-generates layout ID (GUID).
 * Emits save with { id, label, description, layout } or close on cancel.
 */
import { ref, watch } from 'vue'

const props = defineProps({
  /** Whether the offcanvas is visible. */
  show: { type: Boolean, default: false },
  /** The layout object to save (rows/columns structure). Passed through to save payload. */
  layout: { type: Object, default: null },
  /** Optional title (e.g. "Save Tile Layout" or "Save Dashboard"). */
  title: { type: String, default: 'Save Tile Layout' },
  /** Optional label placeholder. */
  labelPlaceholder: { type: String, default: 'e.g. Main Dashboard' },
})

const emit = defineEmits(['close', 'save'])

function generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  )
}

const layoutLabel = ref('')
const description = ref('')
const layoutId = ref('')

function resetForm() {
  layoutLabel.value = ''
  description.value = ''
  layoutId.value = generateGuid()
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

function handleSave() {
  const label = (layoutLabel.value || '').trim()
  if (!label) {
    return
  }
  emit('save', {
    id: layoutId.value,
    label,
    description: (description.value || '').trim(),
    layout: props.layout,
  })
  emit('close')
}

function handleCancel() {
  emit('close')
}
</script>

<template>
  <div>
    <div
      class="offcanvas offcanvas-end shadow-lg save-tile-layout-offcanvas"
      tabindex="-1"
      :class="{ show }"
      :aria-modal="show"
      aria-labelledby="save-tile-layout-offcanvas-label"
      :style="show ? { visibility: 'visible', zIndex: 1060 } : { visibility: 'hidden' }"
      data-bs-scroll="true"
      data-bs-backdrop="false"
    >
      <div class="offcanvas-header border-bottom bg-body">
        <h5 id="save-tile-layout-offcanvas-label" class="offcanvas-title fw-semibold mb-0">
          <i class="fa-solid fa-floppy-disk me-2 text-primary"></i>
          {{ title }}
        </h5>
        <button type="button" class="btn-close" aria-label="Close" @click="handleCancel" />
      </div>
      <div class="offcanvas-body">
        <div class="mb-3">
          <label for="save-layout-label" class="form-label">Layout Label <span class="text-danger">*</span></label>
          <input
            id="save-layout-label"
            v-model="layoutLabel"
            type="text"
            class="form-control"
            :placeholder="labelPlaceholder"
            maxlength="128"
          />
        </div>
        <div class="mb-3">
          <label for="save-layout-description" class="form-label">Description (optional)</label>
          <textarea
            id="save-layout-description"
            v-model="description"
            class="form-control"
            rows="3"
            placeholder="Brief description of this layout"
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Layout ID</label>
          <input
            :value="layoutId"
            type="text"
            class="form-control form-control-sm font-monospace bg-light"
            readonly
          />
          <small class="text-muted">Auto-generated GUID</small>
        </div>
        <div class="d-flex gap-2 justify-content-end mt-4">
          <button type="button" class="btn btn-outline-secondary" @click="handleCancel">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!(layoutLabel || '').trim()"
            @click="handleSave"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="show"
      class="offcanvas-backdrop fade show save-tile-layout-backdrop"
      style="z-index: 1059"
      @click="handleCancel"
    />
  </div>
</template>

<style scoped>
.save-tile-layout-offcanvas {
  width: 400px;
}
.save-tile-layout-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
