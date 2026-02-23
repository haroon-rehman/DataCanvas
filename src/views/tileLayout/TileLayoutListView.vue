<script setup>
/**
 * TileLayoutListView — lists tile layouts stored in public/config JSON files.
 * Uses Bootstrap grid. Columns: Label (hyperlink), Description (clipped), Created, Updated, Edit.
 * Label links to TileLayoutView (view mode). Edit links to TileLayoutView with edit=1.
 */
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";

const layouts = ref([]);
const loading = ref(true);
const error = ref(null);

const DESCRIPTION_MAX_LENGTH = 80;

function clipText(text) {
  if (!text || typeof text !== "string") return "";
  const t = text.trim();
  if (t.length <= DESCRIPTION_MAX_LENGTH) return t;
  return t.slice(0, DESCRIPTION_MAX_LENGTH) + "…";
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

async function fetchLayouts() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch("/api/tile-layouts");
    const text = await res.text();
    if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
    if (text.startsWith("<")) {
      throw new Error(
        "API not available. Run with npm run dev for tile layout list.",
      );
    }
    layouts.value = JSON.parse(text);
  } catch (e) {
    error.value = e.message;
    layouts.value = [];
  } finally {
    loading.value = false;
  }
}

async function deleteLayout(item) {
  try {
    const res = await fetch(`/api/tile-layouts/${encodeURIComponent(item.id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Delete failed: ${res.status}`);
    }
    await fetchLayouts();
  } catch (e) {
    alert(`Failed to delete: ${e.message}`);
  }
}

function confirmDelete(item) {
  if (confirm(`Delete layout "${item.label || item.id}"?`)) {
    deleteLayout(item);
  }
}

onMounted(fetchLayouts);
</script>

<template>
  <div class="tile-layout-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">
        <i class="fa-solid fa-table-cells me-2 text-primary"></i>
        Tile Layouts
      </h2>
      <RouterLink to="/tile-layout?edit=1" class="btn btn-primary">
        <i class="fa-solid fa-plus me-1"></i>
        New Layout
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="fa-solid fa-triangle-exclamation me-2"></i>
      {{ error }}
    </div>

    <div v-else-if="!layouts.length" class="card">
      <div class="card-body text-center py-5 text-muted">
        <i class="fa-solid fa-inbox fa-3x mb-3 opacity-50"></i>
        <p class="mb-0">No tile layouts saved yet.</p>
        <RouterLink
          to="/tile-layout?edit=1"
          class="btn btn-outline-primary mt-3"
        >
          Create your first layout
        </RouterLink>
      </div>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>Label</th>
            <th>Description</th>
            <th>Created</th>
            <th>Updated</th>
            <th class="text-end" style="width: 140px">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in layouts" :key="item.id">
            <td>
              <RouterLink
                :to="{ path: '/tile-layout', query: { id: item.id } }"
                class="text-decoration-none fw-medium"
              >
                {{ item.label || item.id }}
              </RouterLink>
            </td>
            <td>
              <span
                class="text-muted text-truncate d-inline-block"
                :title="item.description"
                style="max-width: 300px"
              >
                {{ clipText(item.description) || "—" }}
              </span>
            </td>
            <td class="text-nowrap small text-muted">
              {{ formatDateTime(item.created) }}
            </td>
            <td class="text-nowrap small text-muted">
              {{ formatDateTime(item.updated) }}
            </td>
            <td class="text-end">
              <div class="btn-group btn-group-sm" role="group">
                <RouterLink
                  :to="{ path: '/tile-layout', query: { id: item.id } }"
                  class="btn btn-outline-secondary"
                  title="View layout"
                >
                  <i class="fa-solid fa-eye"></i>
                </RouterLink>
                <RouterLink
                  :to="{
                    path: '/tile-layout',
                    query: { id: item.id, edit: '1' },
                  }"
                  class="btn btn-outline-secondary"
                  title="Edit layout"
                >
                  <i class="fa-solid fa-pen"></i>
                </RouterLink>
                <button
                  type="button"
                  class="btn btn-outline-danger"
                  title="Delete layout"
                  @click="confirmDelete(item)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.tile-layout-list {
  width: 100%;
}
</style>
