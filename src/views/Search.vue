<template>
    <div id="app">
        <v-app-bar elevation="1">
            <v-app-bar-title>搜索路线</v-app-bar-title>
        </v-app-bar>
        <div class="">
            <v-text-field v-model="searchQuery" ref="searchField" label="线路名称" hide-details
                @update:modelValue="handleInput" />
            <NetworkErr v-if="networkErr" class="my-2" />
            <div v-if="searchQuery && searchQuery != ''" class="flex flex-col gap-2 mt-2">
                <div class="w-full flex justify-center mt-16" v-if="loadingStatus === true">
                    <v-progress-circular indeterminate />
                </div>
                <div v-else-if="routeData.length === 0">
                    <v-empty-state icon="ri:inbox-line" title="找不到结果"></v-empty-state>
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
                                        <v-icon icon="ri:arrow-right-line" />
                                        {{ item.lastsite }}
                                    </div>
                                    <div class="flex flex-row justify-end gap-x-2">
                                        <div>
                                            {{ item.firsttime ? item.firsttime : '--:--' }}~{{ item.lasttime ?
                                                item.lasttime : '--:--' }}
                                        </div>
                                        {{ item.ticketprice }}<span v-if="item.ticketprice !== '分段收费'">元</span>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </div>
            </div>
            <div v-else class="w-full text-center mt-4">
                输入路线名称以开始搜索
            </div>
        </div>
    </div>
</template>

<script>
import { searchRoute } from '@/api/wechatApi'
import NetworkErr from '@/components/NetworkErr.vue'
import debounce from 'lodash/debounce'

export default {
    name: 'Search',
    components: { NetworkErr },
    data() {
        return {
            networkErr: false,
            searchQuery: '',
            routeData: [],
            loadingStatus: false,
            firstInput: true
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.$refs.searchField.focus()
        })
    },
    created() {
        // 创建防抖函数，避免频繁请求
        this.debouncedFetchSearchData = debounce(this.fetchSearchData, 500)
    },
    methods: {
        async fetchSearchData() {
            this.networkErr = false
            this.loadingStatus = true
            await searchRoute({ scontent: this.searchQuery }).then(res => {
                console.log("🚩 ~ searchRoute ~ res 👇\n", res)
                this.routeData = res.lineinfos
            }).catch(error => {
                this.networkErr = true
            }).finally(() => {
                this.loadingStatus = false
            })
        },
        handleInput(newValue) {
            this.searchQuery = newValue.trim()
            if (this.searchQuery) {
                if (this.firstInput) {
                    this.fetchSearchData()
                    this.firstInput = false  // 首次输入完成，标记为false
                } else {
                    this.debouncedFetchSearchData()
                }
            } else {
                this.routeData = []
                this.firstInput = true  // 如果输入为空，重置为首次输入
            }
        },
        navigateToRouteDetail(item) {
            this.$router.push({
                path: '/routedetail',
                query: { id: item.roadid, dir: item.roadstatus }
            })
        }
    }
}
</script>
