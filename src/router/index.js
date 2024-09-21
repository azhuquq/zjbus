import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Search from '@/views/Search.vue'
import Notice from '@/views/Notice.vue'
import RouteDetail from '@/views/RouteDetail.vue'
import Favourite from '@/views/Favourite.vue'
import Import from '@/views/Import.vue'
import Debug from '@/views/Debug.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/search', name: 'Search', component: Search },
    { path: '/notice', name: 'Notice', component: Notice },
    { path: '/routedetail', name: 'RouteDetail', component: RouteDetail, meta: { title: '路线详情' } },
    { path: '/favourite', name: 'Favourite', component: Favourite },
    { path: '/import', name: 'Import', component: Import },
    { path: '/debug', name: 'Debug', component: Debug }
  ]
})


export default router
