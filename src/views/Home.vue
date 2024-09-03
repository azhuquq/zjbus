<template>
    <div id="app">
        <div class="p-2 mt-2">
            <v-text-field 
                v-model="searchQuery" 
                label="搜索线路" 
                hide-details 
                @click="navigateToSearch"
            />
        </div>
        <div class="flex flex-col gap-4 p-2">
            <div class="w-full flex justify-center mt-16" v-if="loadingStatus === true">
                <v-progress-circular indeterminate />
            </div>
            <div v-else v-for="(item, index) in routeData" :key="index">
                <v-card>
                    <v-card-text>
                        <div class="flex flex-row gap-2 align-center justify-between">
                            <div>
                                <div class="text-xl">{{ item.roadname }} </div>
                            </div>
                            <div class="flex flex-col text-right">
                                <div class="text-lg">
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
export default {
    data() {
        return {
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
            this.loadingStatus = true
            searchRoute().then(res => {
                console.log("🚩 ~ searchRoute ~ res 👇\n", res)
                this.routeData = res.lineinfos.filter(item => item.roadstatus === "1")
            }).finally(res => {
                this.loadingStatus = false
            })
        },
        navigateToSearch() {
            this.$router.push('/search') // 跳转到 /search 页面
        }
    }
}
</script>
