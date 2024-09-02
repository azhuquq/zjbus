<template>
  <div id="app">
    <RouterView />
    <BottomNavigation />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import BottomNavigation from './components/BottomNavigation.vue';
</script>

<style></style>
