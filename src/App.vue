<template>
  <div id="app">
    <v-app>
      <v-main>
        <v-container fluid>
          <!-- 使用 keep-alive 缓存特定页面 -->
          <router-view v-slot="{ Component, route }">
            <keep-alive :include="['Home', 'Search', 'Notice']">
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
import { computed } from 'vue'

const route = useRoute()

// 控制底部导航的显示逻辑
const showBottomNavigation = computed(() => {
  return [null, '/', '/search', '/notice'].includes(route.path)
})
</script>
