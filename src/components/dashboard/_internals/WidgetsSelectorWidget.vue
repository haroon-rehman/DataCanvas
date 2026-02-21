<script setup>
/**
 * WidgetsSelectorWidget — offcanvas panel that displays a list of available widgets grouped by category.
 * Used when adding widgets to a cell in the dashboard layout editor.
 */
const props = defineProps({
  /** Whether the offcanvas is visible. */
  show: { type: Boolean, default: false },
  /** Widgets grouped by category: [ { groupName, widgets: [ { type, friendlyName, description, icon } ] } ]. */
  widgetsByGroup: { type: Array, default: () => [] },
  /** Optional info about the selected region (for display purposes). */
  selectedRegionInfo: { type: Object, default: null },
})

const emit = defineEmits(['close', 'selectWidget'])

function handleWidgetClick(widgetType) {
  emit('selectWidget', widgetType)
}
</script>

<template>
  <!-- Offcanvas panel: visibility via .show class and visibility style so it hides when show=false -->
  <div
    class="offcanvas offcanvas-end shadow-lg widgets-selector-offcanvas"
    tabindex="-1"
    :class="{ show }"
    :aria-modal="show"
    aria-labelledby="widgets-selector-offcanvas-label"
    :style="show ? { visibility: 'visible', zIndex: 1060 } : { visibility: 'hidden' }"
    data-bs-scroll="true"
    data-bs-backdrop="false"
  >
    <div class="offcanvas-header border-bottom bg-body">
      <h5 id="widgets-selector-offcanvas-label" class="offcanvas-title fw-semibold mb-0">
        <i class="fa-brands fa-buromobelexperte me-2 text-secondary"></i>
        Widgets Selector
      </h5>
      <button type="button" class="btn-close" aria-label="Close" @click="emit('close')" />
    </div>
    <div class="offcanvas-body p-0 overflow-auto">
      <!-- Has widgets: show grouped widget sections with Bootstrap collapse -->
      <template v-if="widgetsByGroup && widgetsByGroup.length">
        <div v-if="selectedRegionInfo" class="card m-3">
          <div class="card-body">
            <div class="accordion accordion-flush" id="widgets-selector-accordion">
              <div
                v-for="(section, gIndex) in widgetsByGroup"
                :key="section.groupName"
                class="accordion-item"
              >
                <h2 class="accordion-header">
                  <button
                    :class="['accordion-button', { collapsed: gIndex !== 0 }]"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#widgets-collapse-${gIndex}`"
                    :aria-expanded="gIndex === 0"
                    :aria-controls="`widgets-collapse-${gIndex}`"
                  >
                    {{ section.groupName }}
                  </button>
                </h2>
                <div
                  :id="`widgets-collapse-${gIndex}`"
                  :class="['accordion-collapse', 'collapse', { show: gIndex === 0 }]"
                  data-bs-parent="#widgets-selector-accordion"
                >
                  <div class="accordion-body py-2">
                    <ul class="list-unstyled mb-0">
                      <li
                        v-for="w in section.widgets"
                        :key="w.type"
                        class="widget-selector-item d-flex align-items-center gap-2 py-2 px-2 rounded"
                        :title="w.description"
                        role="button"
                        @click="handleWidgetClick(w.type)"
                      >
                        <i :class="w.icon" class="text-secondary" aria-hidden="true"></i>
                        <span class="flex-grow-1">{{ w.friendlyName }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Fallback if no selectedRegionInfo -->
        <div v-else class="card m-3">
          <div class="card-body">
            <p class="text-muted mb-0">No region selected.</p>
          </div>
        </div>
      </template>
      <!-- No widgets: show empty state -->
      <template v-else>
        <div class="card m-3">
          <div class="card-body">
            <p class="text-muted mb-0">No widgets available.</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.widget-selector-item {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.widget-selector-item:hover {
  background-color: var(--bs-tertiary-bg);
}

.widgets-selector-offcanvas {
  width: 460px;
  max-width: 90vw;
  z-index: 1060 !important;
}
</style>
