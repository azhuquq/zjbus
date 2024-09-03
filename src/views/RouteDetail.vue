<template>
    <div id="app">
        <v-app-bar elevation="1">
            <v-btn icon @click="back()">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-app-bar-title>
                {{ title }}
                <div v-if="isLoading && title == ''">
                    <v-progress-circular indeterminate />
                </div>
            </v-app-bar-title>
            <template v-slot:append>
                <div v-if="isLoading && title != ''" class="mr-2">
                    <v-progress-circular indeterminate />
                </div>
                <v-btn icon="ri:arrow-left-right-line" @click="changeDirection()"></v-btn>
            </template>
        </v-app-bar>
        <NetworkErr v-if="networkErr" />
        <div v-if="routeinfo && routeinfo.busstation" class="flex flex-col gap-4">
            <v-card>
                <v-card-text>
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between align-center">
                            <div class="text-lg font-bold">{{ routeinfo.firstsite }}</div>
                            <v-icon>ri:arrow-right-line</v-icon>
                            <div class="text-lg font-bold">{{ routeinfo.lastsite }}</div>
                        </div>
                        <div class="flex flex-row justify-between">
                            <div>
                                首班{{ routeinfo.firsttime ? routeinfo.firsttime : '--:--' }}
                            </div>
                            <div>
                                票价{{ routeinfo.ticketprice }}元
                            </div>
                            <div>
                                末班{{ routeinfo.lasttime ? routeinfo.lasttime : '--:--' }}
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
            <!-- {{ routeinfo }} -->
            <v-card v-for="item in routeinfo.busstation">
                <v-card-text>
                    <div class="flex flex-col">
                        <div class="flex justify-between text-base">
                            <div class="flex flex-row gap-1">
                                <div class="text-xs content-center font-bold">{{ item.stationno }}</div>
                                <div>{{ item.stationname }}</div>
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </div>
        <v-fab icon="ri:refresh-line" color="primary" class="fixed bottom-14 right-20"
            @click="fetchRouteDetail"></v-fab>
    </div>
</template>

<script>
import { getRouteDetail } from '@/api/wechatApi'
import NetworkErr from '@/components/NetworkErr.vue'
export default {
    components: { NetworkErr },
    data() {
        return {
            networkErr: false,
            isLoading: false,
            dir: '0',
            routeid: null, // 用于存储路由参数中的 routeid
            routeinfo: {},
            title: '' // 默认标题
        }
    },
    mounted() {
        this.routeid = this.$route.query.id
        this.dir = this.$route.query.dir || '0'
        this.fetchRouteDetail()

    },
    methods: {
        fetchRouteDetail() {
            this.networkErr = false
            this.isLoading = true
            getRouteDetail({ routeid: this.routeid }).then(res => {
                // 使用 filter 筛选出 roadstatus 为 this.dir 的对象
                this.routeinfo = res.lineinfos ? res.lineinfos.filter(route => route.roadstatus == this.dir)[0] : []
                this.title = `${this.routeinfo.roadname}(开往${this.routeinfo.lastsite})`
            }).catch(error => {
                this.networkErr = true
            }).finally(res => {
                this.isLoading = false
            })
        },
        changeDirection() {
            if (this.dir === '0') {
                this.dir = '1'
            } else {
                this.dir = '0'
            }
            this.fetchRouteDetail()
        },
        back() {
            this.$router.back()
        }
    }
}
</script>