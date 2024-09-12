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
            <template v-slot:append><!-- 右边插槽 -->
                <div v-if="isLoading && title != ''" class="mr-2">
                    <v-progress-circular indeterminate />
                </div>
                <v-btn :icon="isFavourite ? 'ri:star-fill' : 'ri:star-line'" @click="toggleFavourite" v-if="title != ''"
                    :color="isFavourite ? 'amber' : ''">
                </v-btn>
                <v-btn icon="ri:arrow-left-right-line" @click="changeDirection()"></v-btn>
            </template>
        </v-app-bar>
        <NetworkErr v-if="networkErr.live" class="mb-2" />
        <div v-if="routeinfo && routeinfo.busstation" class="flex flex-col gap-2">
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
                                {{ routeinfo?.ticketprice == '分段收费' ? '分段收费' : `票价${routeinfo.ticketprice}元` }}
                            </div>
                            <div>
                                末班{{ routeinfo.lasttime ? routeinfo.lasttime : '--:--' }}
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
            <MapContainer ref="mapContainer" :busStations="routeinfo.busstation" :liveData="liveData" :dir="dir"
                style="height: 38vh;top:64px" class="sticky z-10 elevation-1 rounded" />
            <div v-if="hasFetched && hasFetched === true">
                <div v-if="liveData && liveData.length > 0">
                    <v-alert v-if="filteredBuses.length > 0" icon="ri:bus-line" type="success">
                        {{ filteredBuses.length }} 活动车辆
                    </v-alert>
                    <v-alert v-else type="blue-grey" icon="ri:signpost-line">
                        无活动车辆
                    </v-alert>
                </div>
                <div v-else>
                    <v-alert type="blue-grey" icon="ri:signpost-line">
                        无活动车辆
                    </v-alert>
                </div>
            </div>
            <v-alert icon="ri:flag-2-line" :text="`下一趟车将在${nextStartTime}开出`" type="teal"
                v-if="nextStartTime && nextStartTime != ''"></v-alert>
            <!-- {{ routeinfo }} -->
            <v-card v-for="item in routeinfo.busstation" :key="item.stationno" @click="viewStationDetails(item)">
                <v-card-text>
                    <div class="flex flex-col">
                        <div class="flex justify-between text-base">
                            <div class="flex align-center justify-between w-full">
                                <div class="flex flex-row gap-1 align-center">
                                    <div class="text-xs content-center font-bold">{{ item.stationno }}</div>
                                    <div>{{ item.stationname }}</div>
                                </div>
                                <v-icon>ri:navigation-line</v-icon>
                            </div>
                        </div>
                        <v-divider class="my-1" />
                        <!-- {{ item }} -->
                        <div v-if="getBusForStation(item) && getBusForStation(item).length > 0">
                            <!-- <div v-if="true"> -->
                            <div v-for="bus in getBusForStation(item)" :key="bus.busplate"
                                class="flex items-center gap-4">
                                <v-icon>ri:bus-line</v-icon>
                                <div class="flex flex-col">
                                    <div>车牌号: {{ bus.busplate }}</div>
                                    <div>车速: {{ bus.speed }} km/h</div>
                                    <div>更新时间: {{ formatGpsTime(bus.gpssendtime) }}</div>
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
        <v-fab v-if="isWeChat" icon="ri:qr-code-line" color="primary" class="fixed bottom-24 right-16"
            @click="openQRCode()" />
        <v-fab icon="ri:refresh-line" color="primary" class="fixed bottom-10 right-16" @click="refresh()" />
        <!-- <v-fab icon="ri:map-2-line" color="primary" class="fixed bottom-10 right-16" @click="openMap()" /> -->
        <MPQRCodePanel ref="qrCodePanel" />

    </div>
</template>

<script>
import { getRouteDetail, getBusLiveStatus } from '@/api/wechatApi'
import NetworkErr from '@/components/NetworkErr.vue'
import MPQRCodePanel from '@/components/MPQRCodePanel.vue'
import MapContainer from '@/components/MapContainer.vue'
import moment from 'moment-timezone'
import "moment/dist/locale/zh-cn"
export default {
    components: { NetworkErr, MPQRCodePanel, MapContainer },
    data() {
        return {
            hasFetched: false,
            isFavourite: false,
            networkErr: {
                info: false,
                live: false
            },
            isLoading: false,
            dir: '0',
            routeid: null, // 用于存储路由参数中的 routeid
            routeinfo: {},
            title: '', // 默认标题
            liveData: [],
            nextStartTime: '',
            intervalId: null, // 用于存储定时器ID
            isWeChat: false,
            filteredBuses: []
        }
    },
    mounted() {
        moment.locale('') // 设置为中文
        this.routeid = this.$route.query.id
        if (this.$route.query.dir) {
            this.dir = this.$route.query.dir
        }

        // 判断是否为微信环境（检测 MicroMessenger 或 WeChat）
        this.isWeChat = /MicroMessenger|WeChat/i.test(navigator.userAgent)
        // this.isWeChat = true
        window.addEventListener('routesDataInitialized', this.fetchRouteDetail)
        this.fetchRouteDetail()
        this.checkIfFavourite()
    },
    beforeUnmount() {
        // 在组件销毁时清除定时器
        if (this.intervalId) {
            clearInterval(this.intervalId)
        }
        window.removeEventListener('routesDataInitialized', this.fetchRouteDetail)
    },
    unmounted() {
        // 在组件销毁时清除定时器
        if (this.intervalId) {
            clearInterval(this.intervalId)
        }
    },
    methods: {
        formatGpsTime(gpssendtime) {
            if (gpssendtime) {
                // 使用 moment 解析时间
                const time = moment.tz(gpssendtime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai')
                // 获取相对于现在的时间差
                return time.fromNow() // 例如：'a few seconds ago' 或 '2 minutes ago'
            }
        },
        viewStationDetails(station) {
            // 通过 ref 调用 MapContainer 组件中的方法，并传递 station 信息
            this.$refs.mapContainer.showStationDetails(station)
        },
        async fetchRouteDetail() {
            const storedRoutes = localStorage.getItem('stored_data_routes')
            const routes = storedRoutes ? JSON.parse(storedRoutes) : null
            if (routes && Array.isArray(routes.lineinfos)) {
                // 如果 lineinfos 存在并且是数组，执行 filter
                const routeinfo = routes.lineinfos.filter(route => route.roadid == this.routeid && route.roadstatus == this.dir)[0] || {}
                this.routeinfo = routeinfo
                this.title = `${routeinfo.roadname}(开往${routeinfo.lastsite})`
                console.log("🚩 ~ fetchRouteDetail ~ routeinfo 👇\n", routeinfo)
                this.fetchLive()
                if (!this.intervalId || this.intervalId == null) {
                    this.intervalId = setInterval(() => {
                        this.fetchLive()
                    }, 8000)
                }
            } else {
                this.routeinfo = {}
            }
        },
        changeDirection() {
            if (this.dir === '0') {
                this.dir = '1'
            } else {
                this.dir = '0'
            }
            this.hasFetched = false
            this.filteredBuses = []
            this.nextStartTime = ''
            this.$refs.mapContainer.clearBusMarkers()
            this.fetchRouteDetail()
            this.checkIfFavourite()
        },
        back() {
            this.$router.back()
        },
        async fetchLive() {
            if (this.routeinfo && this.routeinfo != {}) {
                this.isLoading = true
                await getBusLiveStatus({
                    routeid: this.routeid
                }).then(res => {
                    this.networkErr.live = false
                    console.log("🚩 ~ fetchLive ~ res 👇\n", res)
                    // 过滤掉 lastOutSiteMileage 为 0 的数据
                    this.liveData = res.businfos.filter(bus => bus.lastOutSiteMileage !== "0")
                    this.setPlantime(res.nearPlanTime)
                    this.hasFetched = true
                    this.updateFilteredBuses() // 更新 filteredBuses
                    this.$refs.mapContainer.addBusMarkers()
                }).catch(error => {
                    console.log("🚩 ~ getRouteDetail ~ error 👇\n", error)
                    this.networkErr.live = true
                }).finally(() => {
                    this.isLoading = false
                })
            }
        },
        setPlantime(data) {
            console.log("🚩 ~ setPlantime ~ data 👇\n", data)
            // 检查数据是否有效，并且长度为2
            if (data && data.length === 2) {
                // 检查 routeinfo.roadstatus 的值是否为 '1' 或 '0'
                console.log("🚩 ~ routeinfo.roadstatus 👇\n", this.routeinfo.roadstatus)
                // 根据 routeinfo 的 roadstatus 来决定选择数组中的哪个值
                const dirNumber = this.routeinfo.roadstatus === '1' ? 1 : 0
                console.log("🚩 ~ dirNumber 👇\n", dirNumber)
                // 根据 dirNumber 选择对应的发车时间
                this.nextStartTime = data[dirNumber] ? data[dirNumber] : ''
                // 输出最后选择的发车时间
                console.log("🚩 ~ nextStartTime 👇\n", this.nextStartTime)
            } else {
                console.log('无效的 nearPlanTime 数据')
                this.nextStartTime = ''
            }
        },
        // 获取当前站点的车辆信息
        getBusForStation(item) {
            // item为前端item
            // console.log("🚩 ~ getBusForStation ~ stationno,stationname 👇", item)
            const adjustedStationNo = Number(item.stationno) - 1 // 后端的 stationno 比前端小 1，所以减去 1
            return this.liveData.map(bus => ({
                ...bus,
                speed: (Number(bus.speed) / 10).toFixed(1) // 将 speed 除以 10 并保留一位小数
            })).filter(bus =>
                bus.roadstatus == this.dir &&
                bus.stationno == String(adjustedStationNo) &&
                bus.sitename == item.stationname
            )
        },
        refresh() {
            this.fetchLive()
        },
        openQRCode() {
            // 调用子组件的 openSheet 方法来显示 bottom-sheet
            this.$refs.qrCodePanel.openSheet()
        },
        checkIfFavourite() {
            const favourites = JSON.parse(localStorage.getItem('stored_data_favouriteRoutes')) || []
            this.isFavourite = favourites.some(route => route.routeid === this.routeid && route.dir === this.dir)
        },
        // 收藏/取消收藏线路
        toggleFavourite() {
            const favourites = JSON.parse(localStorage.getItem('stored_data_favouriteRoutes')) || []
            const existingIndex = favourites.findIndex(route => route.routeid === this.routeid && route.dir === this.dir)
            if (existingIndex > -1) {
                favourites.splice(existingIndex, 1)
                this.isFavourite = false
            } else {
                // 如果没有收藏，则添加到收藏列表
                const routeData = {
                    routeid: this.routeid,
                    title: this.title,
                    dir: this.dir,
                    routename: this.routeinfo.roadname,
                    laststation: this.routeinfo.lastsite
                }
                favourites.push(routeData)
                this.isFavourite = true
            }

            localStorage.setItem('stored_data_favouriteRoutes', JSON.stringify(favourites))
        },
        updateFilteredBuses() {
            this.filteredBuses = this.liveData.filter(bus => bus.roadstatus == this.dir)
        },

    }
}

</script>
