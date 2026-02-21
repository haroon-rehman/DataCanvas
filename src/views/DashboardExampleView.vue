<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import GridLayoutWidget from "../components/dashboard/widgets/containers/GridLayoutWidget.vue";

const route = useRoute();
const editMode = computed(() => route.query.edit === "1");

const contentGridOptions = {
  column: 12,
  maxColumn: 3,
  row: 6,
};

const widgets = ref([]);
</script>

<template style="overflow: hidden;">
  <div style="overflow: hidden;">
    <GridLayoutWidget
      v-model:widgets="widgets"
      :grid-options="contentGridOptions"
      size-mode="auto"
      backgroundColor="#f8f9fa"
      foregroundColor="#212529"
      :edit-mode="editMode"
    />
  </div>
</template>
