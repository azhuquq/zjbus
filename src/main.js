import { createApp } from 'vue'

// Vuetify

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { Icon } from '@iconify/vue'

// Components
import App from './App.vue'
import router from './router'
import './index.css'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'custom',  // 设置Iconify为默认图标集
        sets: {
            custom: {
                component: Icon,  // 使用Iconify的Icon组件
            },
        },
    },
})


const app = createApp(App)

app.use(router)
app.use(vuetify)
app.mount('#app')
