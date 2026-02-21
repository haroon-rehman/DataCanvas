<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import GridLayoutWidget from '../components/dashboard/widgets/containers/GridLayoutWidget.vue'

const route = useRoute()
const editMode = computed(() => route.query.edit === '1')

const contentGridOptions = {
  column: 3,
  row: 3,
  cellHeight: '200px',
  cellWidth: '200px',
  margin: 8,
}

const widgets = ref([
  { type: 'IconValueWidget', props: { value: '1', label: 'Cell 1', icon: 'fa-star', iconColor: 'gold' }, x: 0, y: 0, w: 1, h: 1 },
  { type: 'ValueWidget', props: { value: '2', label: 'Cell 2' }, x: 1, y: 0, w: 1, h: 1 },
  { type: 'IconValueWidget', props: { value: '3', label: 'Cell 3', icon: 'fa-heart', iconColor: 'crimson' }, x: 2, y: 0, w: 1, h: 1 },
])
</script>

<template>
  <div class="grid-layout-example">
    <h1 class="h4 mb-3">Grid Layout Example</h1>
    <p class="text-muted small mb-3">
      3×3 grid, 200×200px cells. Add <code>?edit=1</code> to the URL for edit mode.
    </p>
    <div class="grid-layout-example__container">
      <GridLayoutWidget
        v-model:widgets="widgets"
        :grid-options="contentGridOptions"
        size-mode="auto"
        background-color="#f8f9fa"
        foreground-color="#dee2e6"
        :edit-mode="editMode"
      />
    </div>
  </div>
</template>

<style scoped>
.grid-layout-example__container {
  max-width: 640px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}
</style>
