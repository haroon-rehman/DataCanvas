import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'gridstack/dist/gridstack.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@cyhnkckali/vue3-color-picker/dist/style.css'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

async function bootstrap() {

  // ⭐ Load font config BEFORE app mounts
  const res = await fetch('/config/fonts.windows.json', {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error(`Failed to load font config: ${res.status}`)
  }

  const fontConfig = await res.json()

  // ⭐ Apply default font immediately (prevents flicker)
  document.documentElement.style.setProperty(
    '--app-font',
    fontConfig.default
  )

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  // ⭐ Make config globally available
  app.provide('fontConfig', Object.freeze(fontConfig))

  app.mount('#app')
}   

bootstrap()

// Bootstrap
//import 'bootstrap/dist/js/bootstrap.bundle.min.js'
