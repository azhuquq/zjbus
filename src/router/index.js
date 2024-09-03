import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/search',
      component: () => import('@/views/Search.vue')
    },
    {
      path: '/notice',
      component: () => import('@/views/Notice.vue')
    }
  ]
})

export default router
