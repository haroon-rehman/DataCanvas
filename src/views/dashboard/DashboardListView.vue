<script setup>
/**
 * DashboardListView — lists dashboards (grid layouts) stored in public/config/dashboards JSON files.
 * Uses Bootstrap table. Columns: Label (hyperlink), Description (clipped), Created, Updated, Edit.
 * Label links to DashboardView (view mode). Edit links to DashboardView with edit=1.
 */
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";

const dashboards = ref([]);
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

async function fetchDashboards() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch("/api/dashboards");
    const text = await res.text();
    if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
    if (text.startsWith("<")) {
      throw new Error(
        "API not available. Run with npm run dev for dashboard list.",
      );
    }
    dashboards.value = JSON.parse(text);
  } catch (e) {
    error.value = e.message;
    dashboards.value = [];
  } finally {
    loading.value = false;
  }
}

async function deleteDashboard(item) {
  try {
    const res = await fetch(`/api/dashboards/${encodeURIComponent(item.id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Delete failed: ${res.status}`);
    }
    await fetchDashboards();
  } catch (e) {
    alert(`Failed to delete: ${e.message}`);
  }
}

function confirmDelete(item) {
  if (confirm(`Delete dashboard "${item.label || item.id}"?`)) {
    deleteDashboard(item);
  }
}

onMounted(fetchDashboards);
</script>

<template>
  <div class="dashboard-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">
        <i class="fa-solid fa-th me-2 text-primary"></i>
        Dashboards
      </h2>
      <RouterLink to="/dashboard?edit=1" class="btn btn-primary">
        <i class="fa-solid fa-plus me-1"></i>
        New Dashboard
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

    <div v-else-if="!dashboards.length" class="card">
      <div class="card-body text-center py-5 text-muted">
        <i class="fa-solid fa-inbox fa-3x mb-3 opacity-50"></i>
        <p class="mb-0">No dashboards saved yet.</p>
        <RouterLink to="/dashboard?edit=1" class="btn btn-outline-primary mt-3">
          Create your first dashboard
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
          <tr v-for="item in dashboards" :key="item.id">
            <td>
              <RouterLink
                :to="{ path: '/dashboard', query: { id: item.id } }"
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
                  :to="{ path: '/dashboard', query: { id: item.id } }"
                  class="btn btn-outline-secondary"
                  title="View dashboard"
                >
                  <i class="fa-solid fa-eye"></i>
                </RouterLink>
                <RouterLink
                  :to="{ path: '/dashboard', query: { id: item.id, edit: '1' } }"
                  class="btn btn-outline-secondary"
                  title="Edit dashboard"
                >
                  <i class="fa-solid fa-pen"></i>
                </RouterLink>
                <button
                  type="button"
                  class="btn btn-outline-danger"
                  title="Delete dashboard"
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
.dashboard-list {
  width: 100%;
}
</style>
