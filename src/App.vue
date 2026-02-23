<script setup>
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";

const showMenu = ref(false);
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div class="container-fluid">
        <RouterLink class="navbar-brand fw-semibold" to="/">ADNOC</RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          @click="showMenu = !showMenu"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" :class="{ show: showMenu }">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/" exact-active-class="active"
                >Home</RouterLink
              >
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/tile-layouts"
                exact-active-class="active"
                >Tile Layouts</RouterLink
              >
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/dashboards"
                exact-active-class="active"
                >Dashboards</RouterLink
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="container-fluid py-4">
      <RouterView />
    </main>
  </div>
</template>
