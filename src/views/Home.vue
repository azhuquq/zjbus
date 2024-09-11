<template>
    <div id="app">
        <v-app-bar elevation="1">
            <v-app-bar-title>湛江公交</v-app-bar-title>
            <!-- <template v-slot:append>
                <v-btn icon="ri:settings-5-line" @click="handleSettingBtnClick()"></v-btn>
            </template> -->
        </v-app-bar>
        <NetworkErr v-if="networkErr" class="mb-4" />
        <div class="flex flex-col gap-2">
            <div class="w-full flex justify-center mt-16" v-if="loadingStatus === true">
                <v-progress-circular indeterminate />
            </div>
            <div v-else v-for="(item, index) in routeData" :key="index">
                <v-card @click="navigateToRouteDetail(item)">
                    <v-card-text>
                        <div class="flex flex-row gap-2 align-center justify-between">
                            <div>
                                <div class="text-xl font-bold">{{ item.roadname }} </div>
                            </div>
                            <div class="flex flex-col text-right">
                                <div class="text-base">
                                    {{ item.firstsite }}
                                    <v-icon icon="ri:arrow-left-right-line" />
                                    {{ item.lastsite }}
                                </div>
                                <div>
                                    {{ item.ticketprice }}<span v-if="item.ticketprice !== '分段收费'">元</span>
                                </div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </div>
        </div>
        <v-dialog v-model="settingDialog">
            <Settings />
        </v-dialog>
    </div>
</template>

<script>
import { searchRoute } from '@/api/wechatApi'
import NetworkErr from '@/components/NetworkErr.vue'
import Settings from '@/components/Settings.vue'
export default {
    name: 'Home',
    components: { NetworkErr, Settings },
    data() {
        return {
            networkErr: false,
            searchQuery: '', // 添加 searchQuery 绑定
            routeData: [],
            loadingStatus: false,
            settingDialog: false
        }
    },
    computed: {
    },
    activated() {
        this.getItems()

        // 监听 routesUpdated 事件，当数据更新时重新加载数据
        window.addEventListener('routesUpdated', this.getItems)
    },
    deactivated() {
        // 组件销毁时移除事件监听
        window.removeEventListener('routesUpdated', this.getItems)
    },
    methods: {
        getItems() {
            const storedRoutes = localStorage.getItem('stored_data_routes')
            const routes = storedRoutes ? JSON.parse(storedRoutes) : null

            if (routes && Array.isArray(routes.lineinfos)) {
                // 如果 lineinfos 存在并且是数组，执行 filter
                this.routeData = routes.lineinfos.filter(item => item.roadstatus === "0")
            } else {
                // 如果没有路由数据，设置 routeData 为一个空数组
                this.routeData = []
                console.warn("没有找到有效的路由数据，'stored_data_routes' 可能为空或不存在。")
            }
        },
        handleSettingBtnClick() {
            this.settingDialog = true
        },
        navigateToRouteDetail(item) {
            this.$router.push({
                path: '/routedetail',
                query: { id: item.roadid }
            })
        }
    }
}
</script>
