<template>
    <div id="app">
        <div class="p-2">
            <v-text-field
                v-model="searchQuery"
                ref="searchField"
                label="线路名称"
                hide-details
                class="my-2"
            />
            <div v-if="searchQuery && searchQuery != ''" class="flex flex-col gap-4 mt-2">
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
            <div v-else class="w-full text-center">
                输入线路名称以开始搜索
            </div>
        </div>
    </div>
</template>

<script>
import { searchRoute } from '@/api/wechatApi'
export default {
    data() {
        return {
            searchQuery: '',
            routeData: [],
            loadingStatus: false
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.$refs.searchField.focus()
        })
    },
    watch: {
        searchQuery(newQuery) {
            if (newQuery.trim() !== '') {
                this.fetchSearchData()
            } else {
                this.routeData = []
            }
        }
    },
    methods: {
        fetchSearchData() {
            this.loadingStatus = true
            searchRoute({ scontent: this.searchQuery }).then(res => {
                console.log("🚩 ~ searchRoute ~ res 👇\n", res)
                this.routeData = res.lineinfos
            }).finally(() => {
                this.loadingStatus = false
            })
        }
    }
}
</script>
