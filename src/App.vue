<template>
  <div id="app">
    <v-app color="grey-darken-3">
      <v-main>
        <v-container fluid>
          <!-- 使用 keep-alive 缓存特定页面 -->
          <router-view v-slot="{ Component, route }">
            <keep-alive :include="cachedPages">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </router-view>
        </v-container>
      </v-main>
      <v-footer app class="p-0">
        <BottomNavigation v-if="showBottomNavigation" />
      </v-footer>
    </v-app>
  </div>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router'
import BottomNavigation from './components/BottomNavigation.vue'
import { computed, ref } from 'vue'

const route = useRoute()

// 控制底部导航的显示逻辑
const showBottomNavigation = computed(() => {
  return [null, '/', '/search', '/notice','/favourite'].includes(route.path)
})

// 动态控制要缓存的页面
const cachedPages = ref(['Home', 'Search', 'Notice',"Favourite"])  // 指定需要缓存的路由 name
</script>
<style>
.v-application {
  background-color: #F5F5F5; /* blue-grey lighten-5 */
}</style>