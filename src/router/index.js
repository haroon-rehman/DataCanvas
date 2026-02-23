import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/dashboards',
      name: 'dashboards',
      component: () => import('../views/dashboard/DashboardListView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/dashboard/DashboardView.vue'),
    },
    {
      path: '/tile-layouts',
      name: 'tile-layouts',
      component: () => import('../views/tileLayout/TileLayoutListView.vue'),
    },
    {
      path: '/tile-layout',
      name: 'tile-layout',
      component: () => import('../views/tileLayout/TileLayoutView.vue'),
    },
    {
      path: '/grid',
      name: 'grid',
      redirect: { name: 'tile-layout' },
    },
  ],
})

export default router
