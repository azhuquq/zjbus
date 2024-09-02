import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    proxy: {
      '/wechatapi': {
        target: 'http://wechat.zhjgongjiao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wechatapi/, ''),
      },
      '/websiteapi': {
        target: 'http://zhjgongjiao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/websiteapi/, ''),
        headers: {
          Host: 'zhjgongjiao.com'
        }
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
