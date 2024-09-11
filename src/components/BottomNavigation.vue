<template>
    <v-layout class="overflow-visible" style="height: 56px;">
        <v-bottom-navigation color="primary" mode="shift" v-model="value" mandatory>
            <v-btn @click="navigateTo('/')" value="/" rounded="pill">
                <v-icon>{{ getIcon('/', 'route') }}</v-icon>
                <span>路线</span>
            </v-btn>
            <v-btn @click="navigateTo('/favourite')" value="/favourite" rounded="pill">
                <v-icon>{{ getIcon('/favourite', 'star') }}</v-icon>
                <span>收藏</span>
            </v-btn>
            <v-btn @click="navigateTo('/search')" value="/search" rounded="pill">
                <v-icon>{{ getIcon('/search', 'search') }}</v-icon>
                <span>搜索</span>
            </v-btn>
            <v-btn @click="navigateTo('/planning')" value="/planning" rounded="pill">
                <v-icon>{{ getIcon('/planning', 'signpost') }}</v-icon>
                <span>站点</span>
            </v-btn>
            <v-btn @click="navigateTo('/notice')" value="/notice" rounded="pill">
                <v-icon>{{ getIcon('/notice', 'sticky-note') }}</v-icon>
                <span>通告</span>
            </v-btn>
        </v-bottom-navigation>
    </v-layout>
</template>

<script>
export default {
    data() {
        return {
            value: '/'
        }
    },
    mounted() {
        this.value = this.$route.path // 初始化时设置当前路由的路径
        console.log("🚩 ~ mounted ~ this.value 👇\n", this.value)

        // 监听路由变化
        this.$watch(
            () => this.$route.path,
            (newPath) => {
                console.log("🚩 ~ path changed ~ newPath 👇\n", newPath)
                this.value = newPath
            }
        )
    },
    methods: {
        navigateTo(path) {
            this.$router.push(path)
        },
        getIcon(path, icon) {
            // 判断当前路径是否为选中的路径，返回相应的图标
            return this.value === path ? `ri:${icon}-fill` : `ri:${icon}-line`
        }
    }
}
</script>
