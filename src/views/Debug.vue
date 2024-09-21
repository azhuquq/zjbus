<template>
    <div id="app">
        <v-app-bar elevation="1">
            <v-btn icon @click="goHome()">
                <v-icon>ri:home-line</v-icon>
            </v-btn>
            <v-app-bar-title>调试工具</v-app-bar-title>
        </v-app-bar>
        <div class="flex flex-col gap-2">
            <div v-for="(item, key) in tool" :key="key" @click="toggleTool(item)">
                <v-card :title="item.name" :subtitle="item.subtitle">
                    <v-card-text class="flex flex-row align-center justify-between">
                        <div class="flex-1">{{ item.desc }}</div>
                        <v-switch color="primary" v-model="item.active" hide-details inline
                            density="compact"></v-switch>
                    </v-card-text>
                </v-card>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Debugger',
    goHome() {
        this.$router.push('/')
        this.$router.go(0)
    },
    mounted() {
        // 初始化时从 localStorage 读取状态
        this.tool.forEach(toolItem => {
            toolItem.active = localStorage.getItem(`stored_data_use${toolItem.name.charAt(0).toUpperCase() + toolItem.name.slice(1)}`) === 'true'
        })
    },
    data() {
        return {
            tool: [
                { name: 'eruda', active: false, desc: 'Console for Mobile Browsers.', subtitle: 'https://github.com/liriliri/eruda' },
                { name: 'vconsole', active: false, desc: '一个轻量、可拓展、针对手机网页的前端开发者调试面板。', subtitle: 'https://github.com/Tencent/vConsole' }
            ]
        }
    },
    methods: {
        // 当点击时切换 localStorage 中对应的值
        toggleTool(item) {
            item.active = !item.active
            const key = `stored_data_use${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`
            localStorage.setItem(key, item.active)
        }
    }
}
</script>