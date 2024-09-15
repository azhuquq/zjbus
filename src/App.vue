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
      <!-- 添加 v-dialog 显示正在获取数据 -->
      <v-dialog v-model="isFetchingData" persistent max-width="290">
        <v-card :title="fetchTitle">
          <v-card-text>
            <v-progress-circular indeterminate v-if="!isError" />
            <div v-else>不妨试试重新加载？当然也很有可能是中转服务器/接口出错了（悲）</div>
          </v-card-text>
          <v-card-actions v-if="isError">
            <v-btn color="primary" text @click="retryFetchRoutes">重新获取</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar v-model="snackbar.show" :timeout="3000">
        {{ snackbar.text }}
      </v-snackbar>
      <v-snackbar v-model="headsUpNotify" :timeout="100000" location="top" close-on-content-click rounded="xl"
        variant="tonal" color="deep-orange" vertical content-class="notify-snackbar" centered>
        <div class="flex flex-col justify-center items-center text-center w-full gap-1">
          <v-icon size="36">ri:arrow-up-line</v-icon>
          <div class="text-xl font-bold">请抬头看路</div>
          <div class="text-xs">轻触以关闭</div>
        </div>
      </v-snackbar>

    </v-app>
  </div>
</template>

<script setup>
import useHeadsUpSensor from '@/utils/headsUpSensor'
import { RouterView, useRoute } from 'vue-router'
import BottomNavigation from './components/BottomNavigation.vue'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { fetchRoutesIfNeeded } from '@/utils/fetchAllRoutes'
const route = useRoute()
// 控制底部导航的显示逻辑
const showBottomNavigation = computed(() => {
  return [null, '/', '/search', '/notice', '/favourite'].includes(route.path)
})
// 动态控制要缓存的页面
const cachedPages = ref(['Home', 'Search', 'Notice', 'Favourite'])  // 指定需要缓存的路由 name
// 添加 v-dialog 的状态控制
const isFetchingData = ref(false)
const isLoading = ref(true)
const isError = ref(false)

// const headsUpNotify = ref(true)
const { headsUpNotify, hideHeadsUp } = useHeadsUpSensor()

// 添加 snackbar 的状态控制
const snackbar = ref({
  show: false,  // 将属性名从 'open' 改为 'show'
  text: ''
})

// fetch 状态相关
const fetchTitle = ref('获取数据中......')

// 监听事件
const onShowSnackbar = (event) => {
  console.log("🚩 ~ onShowSnackbar ~ event 👇\n", event)
  snackbar.value.text = `${event.detail.text}`
  snackbar.value.show = true
}

// 封装获取数据的逻辑
const fetchRoutes = async () => {
  const cachedRoutes = localStorage.getItem('stored_data_routes')
  if (!cachedRoutes) {
    isFetchingData.value = true  // 弹出对话框
  }
  try {
    isLoading.value = true
    console.log('Fetching routes...')
    fetchTitle.value = '获取数据中......'
    await fetchRoutesIfNeeded()
    console.log('Fetching completed')
    // 设置状态
    isLoading.value = false
    isLoading.value = false
    isFetchingData.value = false
    isError.value = false
    // 数据获取完成后发出全局事件
    const event = new Event('routesDataInitialized')
    window.dispatchEvent(event)
  } catch (error) {
    fetchTitle.value = '数据获取失败'
    console.error('数据获取失败:', error)
    isError.value = true
    isLoading.value = false
  }
}

// 调用获取数据
onMounted(() => {
  fetchRoutes()
  window.addEventListener('showSnackbar', onShowSnackbar)
})

onUnmounted(() => {
  window.removeEventListener('showSnackbar', onShowSnackbar)
})
// 重新获取数据的按钮逻辑
const retryFetchRoutes = () => {
  isError.value = false
  isLoading.value = true
  fetchRoutes()
}
</script>


<style>
.v-application {
  background-color: #F5F5F5;
}

.notify-snackbar {
  .v-snackbar__content {
    width: 100%;
  }
}
</style>
