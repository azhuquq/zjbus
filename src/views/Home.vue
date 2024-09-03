<template>
    <div id="app">
        <v-app-bar elevation="1">
            <v-app-bar-title>湛江公交</v-app-bar-title>
            <template v-slot:append>
                <v-btn icon="ri:search-line" @click="navigateToSearch()"></v-btn>
            </template>
        </v-app-bar>
        <NetworkErr v-if="networkErr" />
        <div class="flex flex-col gap-4">
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
    </div>
</template>

<script>
import { searchRoute } from '@/api/wechatApi'
import NetworkErr from '@/components/NetworkErr.vue'
export default {
    components: { NetworkErr },
    data() {
        return {
            networkErr: false,
            searchQuery: '', // 添加 searchQuery 绑定
            routeData: [],
            loadingStatus: false
        }
    },
    computed: {
    },
    mounted() {
        this.fetchSearchData()
    },
    methods: {
        fetchSearchData() {
            this.networkErr = false
            this.loadingStatus = true
            searchRoute().then(res => {
                console.log("🚩 ~ searchRoute ~ res 👇\n", res)
                this.routeData = res.lineinfos.filter(item => item.roadstatus === "0")
            }).catch(err => {
                this.networkErr = true
            }).finally(res => {
                this.loadingStatus = false
            })
        },
        navigateToSearch() {
            this.$router.push('/search') // 跳转到 /search 页面
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
