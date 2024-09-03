<template>
    <v-layout class="overflow-visible">
        <v-bottom-navigation color="primary" mode="shift" v-model="value">
            <v-btn @click="navigateTo('/')" value="/">
                <v-icon>ri:route-line</v-icon>
                <span>路线</span>
            </v-btn>
            <v-btn @click="navigateTo('/search')" value="/search">
                <v-icon>ri:search-line</v-icon>
                <span>搜索</span>
            </v-btn>
            <v-btn @click="navigateTo('/notice')" value="/notice">
                <v-icon>ri:sticky-note-line</v-icon>
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
        }
    }
}
</script>
