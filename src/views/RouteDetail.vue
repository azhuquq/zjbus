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
                <v-card class="bg-indigo">
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
                <v-alert icon="ri:flag-2-line" :text="`下一趟车将在${nextStartTime}开出`" type="success"
                    v-if="nextStartTime && nextStartTime != ''" />
                <!-- {{ routeinfo }} -->
                <v-card v-for="item in routeinfo.busstation" :key="item.stationno">
                    <v-card-text>
                        <div class="flex flex-col">
                            <div class="flex justify-between text-base">
                                <div class="flex flex-row gap-1">
                                    <div class="text-xs content-center font-bold">{{ item.stationno }}</div>
                                    <div>{{ item.stationname }}</div>
                                </div>
                            </div>
                            <v-divider class="my-2" />
                            <div v-if="getBusForStation(item) && getBusForStation(item).length > 0">
                                <!-- <div v-if="true"> -->
                                <!-- {{ item.stationname }} -->
                                <div v-for="bus in getBusForStation(item)" :key="bus.busplate"
                                    class="flex items-center gap-4">
                                    <v-icon>ri:bus-line</v-icon>
                                    <div class="flex flex-col">
                                        <div>车牌号: {{ bus.busplate }}</div>
                                        <div>车速: {{ bus.speed }} km/h</div>
                                        <div>更新时间: {{ bus.gpssendtime }}</div>
                                    </div>
                                </div>
                            </div>
                            <div v-else>
                                <div>暂无车辆信息</div>
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
import { getRouteDetail, getBusLiveStatus } from '@/api/wechatApi'
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
            title: '', // 默认标题
            liveData: [],
            nextPlanTime: ''
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
                this.fetchLive()
            }).catch(error => {
                console.log("🚩 ~ getRouteDetail ~ error 👇\n", error)
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
        },
        fetchLive() {
            if (this.routeinfo && this.routeinfo != {}) {
                getBusLiveStatus({
                    routeid: this.routeid
                }).then(res => {
                    console.log("🚩 ~ fetchLive ~ res 👇\n", res)
                    this.setPlantime(res.nearPlanTime)
                    this.liveData = res.businfos
                })
            }
        },
        setPlantime(data) {
            console.log("🚩 ~ setPlantime ~ data 👇\n", data)
            if (data && data.length > 0) {
                this.nextStartTime = data[this.dir] ? data[this.dir] : ''
            } else {
                this.nextStartTime = ''
            }
        },
        // 获取当前站点的车辆信息
        getBusForStation(item) {
            console.log("🚩 ~ getBusForStation ~ stationno,stationname 👇", item)
            const adjustedStationNo = Number(item.stationno) - 1 // 后端的 stationno 比前端小 1，所以减去 1
            return this.liveData.map(bus => ({
                ...bus,
                speed: (Number(bus.speed) / 10).toFixed(1) // 将 speed 除以 10 并保留一位小数
            })).filter(bus =>
                bus.stationno == String(adjustedStationNo) &&
                bus.sitename == item.stationname
            )
        }

    }
}
</script>
