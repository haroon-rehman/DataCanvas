<script setup>
</script>

<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="p-5 mb-4 bg-body-secondary rounded-3">
          <div class="container-fluid py-2">
            <h1 class="display-5 fw-bold">Welcome to Vue 3</h1>
            <p class="col-md-8 fs-5">
              This is a basic example using Vue 3 with Vue Router and Bootstrap. Use the navbar to switch between Home and About.
            </p>
            <router-link to="/about" class="btn btn-primary btn-lg" type="button">Go to About</router-link>
          </div>
        </div>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">Components</h5>
                <p class="card-text">App.vue, HomeView, and AboutView are Vue 3 single-file components.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">Bootstrap 5</h5>
                <p class="card-text">Layout and styling use Bootstrap CSS utilities and components only.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">Vue Router</h5>
                <p class="card-text">Navigation between views is handled by Vue Router.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
