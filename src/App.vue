<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const showMenu = ref(false)
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div class="container-fluid">
        <RouterLink class="navbar-brand fw-semibold" to="/">Vue 3 App</RouterLink>
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
              <RouterLink class="nav-link" to="/" exact-active-class="active">Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/about" exact-active-class="active">About</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/dashboard-example" exact-active-class="active">Dashboard Example</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/grid" exact-active-class="active">Grid</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/tile-layout" exact-active-class="active">Tile Layout</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/grid-layout-example" exact-active-class="active">Grid Layout Example</RouterLink>
            </li>
          </ul>
          <div class="d-flex align-items-center gap-2">
            <input class="form-control" placeholder="Search" type="search" />
            <button class="btn btn-outline-primary" type="button">Login</button>
          </div>
        </div>
      </div>
    </nav>
    <main class="container-fluid py-4">
      <RouterView />
    </main>
</template>
