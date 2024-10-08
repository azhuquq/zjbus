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
    port: 5173,
    proxy: {
      '/wechatapi': {
        target: 'http://wechat.zhjgongjiao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wechatapi/, ''),
      },
      '/getallapi': {
        target: 'http://wechat.zhjgongjiao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/getallapi/, ''),
      },
      '/websiteapi': {
        target: 'http://zhjgongjiao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/websiteapi/, ''),
        headers: {
          Host: 'zhjgongjiao.com'
        }
      },
      '/webimg': {
        target: 'http://www.zhjgongjiao.com/uploads/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webimg/, ''),
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
