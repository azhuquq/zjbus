<template>
  <div id="app">
    <v-app>
      <v-main>
        <v-container fluid>
          <RouterView @update:title="updateTitle" />
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

const showBottomNavigation = computed(() => {
  return [null, '/', '/search', '/notice'].includes(route.path)
})

</script>
