<template>
    <div>
        <v-app-bar elevation="1">
            <v-app-bar-title>收藏路线</v-app-bar-title>
            <template v-slot:append>
                <div v-if="!isLocationLoaded && favourites.length != 0">
                    <v-btn icon="ri:map-pin-line" @click="requestLocation()"></v-btn>
                </div>

                <div v-if="isRefreshingStat" class="me-2">
                    <v-progress-circular indeterminate />
                </div>
                <div v-else>
                    <v-btn icon="ri:refresh-line" @click="refresh"></v-btn>
                </div>
            </template>
        </v-app-bar>
        <div v-if="favourites.length === 0">
            <v-empty-state icon="ri:bookmark-line" title="无收藏路线">
                <template v-slot:text>
                    <div class="align-center">
                        您可以点击路线详情的右上角<v-icon>ri:star-s-line</v-icon>进行收藏
                    </div>
                </template>
            </v-empty-state>
        </div>
        <!-- 上面的不用改 -->
        <div v-else class="flex flex-col gap-2">
            <!-- 如果任一线路请求失败，显示网络错误组件 -->
            <NetworkErr v-if="hasErrorStat" />
            <v-card v-for="(item, index) in mergedFavourites" :key="index">
                <template v-slot:title>
                    <div class="text-xl font-bold">
                        {{ item.routename }}
                    </div>
                </template>
                <div class="font-bold text-lg">
                    <v-card v-for="(per, index) in item.directions" :key="index" @click="goToRouteDetail(per)"
                        variant="flat" :title="per.laststation">
                        <template v-slot:title>
                            <div class="text-lg font-bold flex flex-row justify-between align-center">
                                <div>
                                    开往 {{ per.laststation }}
                                </div>
                                <v-icon>ri:navigation-line</v-icon>
                            </div>
                        </template>
                        <template v-slot:subtitle v-if="per.nearestStop">
                            {{
                                `离您最近：${per.nearestStop.stationNo} ${per.nearestStop.stationName}`
                            }}
                        </template>

                        <v-card-text>
                            <!-- 初始化标志变量，默认没有活动车辆 -->
                            <template v-if="item.isLoaded">
                                <div v-if="item.status && item.status.length > 0">
                                    <template v-if="hasActiveBuses(item.status, per.dir)">
                                        <!-- 有活动车辆时 -->
                                        <div class="flex flex-row overflow-x-auto whitespace-nowrap">
                                            <div v-for="(bus, index) in item.status" :key="index">
                                                <div v-if="bus.roadstatus && bus.roadstatus === per.dir">
                                                    <v-chip class="p-2 me-2" color="green" label>
                                                        <v-icon icon="ri:bus-line" start />
                                                        {{ `${fixNo(bus.stationno)} ${bus.sitename}
                                                        ${fixSpeed(bus.speed)} km/h` }}
                                                    </v-chip>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <!-- 当前方向没有活动车辆 -->
                                        <v-chip class="p-2" label color="primary">
                                            <v-icon icon="ri:signpost-line" start />
                                            无活动车辆
                                        </v-chip>
                                    </template>
                                </div>
                                <div v-else>
                                    <!-- 当前线路没有状态 -->
                                    <v-chip class="p-2" label color="primary">
                                        <v-icon icon="ri:signpost-line" start />
                                        无活动车辆
                                    </v-chip>
                                </div>
                            </template>
                            <div v-else>
                                <!-- 未加载完成时显示未知 -->
                                <v-chip class="p-2" label>
                                    <v-icon icon="ri:questionnaire-line" start />
                                    未知
                                </v-chip>
                            </div>
                        </v-card-text>
                    </v-card>
                </div>
            </v-card>
        </div>
    </div>
</template>

<script>
import { getBusLiveStatus } from '@/api/wechatApi'
import NetworkErr from '@/components/NetworkErr.vue'
export default {
    name: 'Favourite',
    components: { NetworkErr },
    data() {
        return {
            favourites: [], // 用于存储收藏的线路信息
            mergedFavourites: [], // 存储合并后的收藏路线
            firstLoad: true, // 标志判断是否首次加载
            isRefreshing: false, // 标志是否正在刷新
            hasError: false, // 标志是否有网络错误
            favouritesSnapshot: null,
            timers: [],
            isLocationLoaded: false,
            locationTimer: null,
        }
    },
    computed: {
        isRefreshingStat() {
            // 检查 mergedFavourites 中是否有任何项目正在刷新
            return this.mergedFavourites.some(fav => fav.isRefreshing)
        },
        hasErrorStat() {
            // 检查 mergedFavourites 中是否有任何项 目出现错误
            return this.mergedFavourites.some(fav => fav.isError)
        }
    },
    mounted() {
        // 从 localStorage 中读取收藏的线路，并进行合并
        this.favourites = JSON.parse(localStorage.getItem('stored_data_favouriteRoutes')) || []
        this.mergeFavourites() // 初始化合并收藏路线
        this.favouritesSnapshot = JSON.stringify(this.favourites) // 保存收藏列表快照
        this.refresh() // 初次加载时自动刷新
    },
    activated() {
        const currentFavourites = JSON.parse(localStorage.getItem('stored_data_favouriteRoutes')) || []
        if (JSON.stringify(currentFavourites) !== JSON.stringify(this.favourites)) {
            this.favourites = currentFavourites
            this.mergeFavourites() // 如果发生变化，重新合并收藏路线
            this.refresh() // 触发刷新
        }
        this.requestLocation()
        this.setupTimers()
    },
    deactivated() {
        this.clearTimers()
    },
    beforeUnmount() {
        this.clearTimers()
    },
    methods: {
        requestLocation() {
            console.log("requestLocation 被调用了")
            if (navigator.geolocation) {
                console.log("navigator.geolocation 存在")
                navigator.geolocation.getCurrentPosition(
                    position => {
                        console.log("成功获取用户位置", position)
                        const userLat = position.coords.latitude
                        const userLng = position.coords.longitude
                        this.findNearestStopForAllRoutes(userLat, userLng)
                        this.isLocationLoaded = true // 成功获取位置后标记为true
                        if (!this.locationTimer) {
                            console.log("locationTimer setting")
                            this.setupLocationTimer() // 开始定期刷新位置
                        }
                    },
                    error => {
                        console.error("无法获取用户位置", error)
                    }
                )
            } else {
                console.error("浏览器不支持地理位置获取")
            }
        },
        findNearestStopForAllRoutes(userLat, userLng) {
            const favouriteRoutes = this.mergedFavourites // 使用 mergedFavourites
            const allRoutes = JSON.parse(localStorage.getItem('stored_data_routes')) || {}

            // 对每条路线查找最近车站
            favouriteRoutes.forEach(route => {
                route.directions.forEach(direction => {
                    this.findNearestStopForDirection(route, direction, allRoutes, userLat, userLng)
                })
            })
        },
        findNearestStopForDirection(route, direction, allRoutes, userLat, userLng) {
            const routeData = allRoutes.lineinfos.find(line => line.roadid === direction.routeid && line.roadstatus === direction.dir)
            if (routeData) {
                let nearestStop = null
                let minDistance = Infinity
                routeData.busstation.forEach(station => {
                    const { lat, lng } = this.parseLatLng(station.lng, station.lat)
                    // console.log("🚩 ~ findNearestStopForDirection ~ lat, lng 👇\n", station, lat, lng)
                    const distance = this.calculateDistance(userLat, userLng, parseFloat(lat), parseFloat(lng))
                    if (distance < minDistance) {
                        minDistance = distance
                        nearestStop = {
                            routeName: route.routename,
                            stationName: station.stationname,
                            stationNo: station.stationno,
                            distance: distance.toFixed(2),
                            direction: direction.dir
                        }
                    }
                })
                // 将最近的车站存储到 direction 对象中
                direction.nearestStop = nearestStop
            }
        },
        calculateDistance(lat1, lng1, lat2, lng2) {
            const toRad = (value) => (value * Math.PI) / 180
            const R = 6371 // 地球半径，单位：公里
            const dLat = toRad(lat2 - lat1)
            const dLng = toRad(lng2 - lng1)
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const distance = R * c // 距离，单位：公里
            return distance
        },
        parseLatLng(lngStr, latStr) {
            let lng = parseFloat(lngStr.slice(1)) / 100
            let lngDegrees = Math.floor(lng)
            let lngMinutes = (lng - lngDegrees) * 100 / 60
            let lngFinal = lngDegrees + lngMinutes
            if (!lngStr.startsWith("E")) {
                lngFinal = -lngFinal
            }

            let lat = parseFloat(latStr.slice(1)) / 100
            let latDegrees = Math.floor(lat)
            let latMinutes = (lat - latDegrees) * 100 / 60
            let latFinal = latDegrees + latMinutes
            if (!latStr.startsWith("N")) {
                latFinal = -latFinal
            }
            return {
                lng: lngFinal.toFixed(6),
                lat: latFinal.toFixed(6)
            }
        },
        setupTimers() {
            // 为每个合并后的路线设置定时刷新
            this.mergedFavourites.forEach((fav, index) => {
                // 每个元素都有自己的定时器，每隔 8 秒调用一次刷新
                const timer = setInterval(() => {
                    this.refreshSingleRoute(fav.routeid)
                }, 8000)
                this.timers.push(timer) // 将定时器保存到 timers 数组中
            })
        },
        setupLocationTimer() {
            this.locationTimer = setInterval(() => {
                this.requestLocation()
            }, 5000)
        },
        clearTimers() {
            this.timers.forEach(timer => clearInterval(timer))
            this.timers = []
            if (this.locationTimer) {
                clearInterval(this.locationTimer) // 清除位置刷新定时器
                this.locationTimer = null
            }
        },
        mergeFavourites() {
            const grouped = {}
            this.favourites.forEach(fav => {
                if (!grouped[fav.routeid]) {
                    grouped[fav.routeid] = {
                        routename: fav.routename,
                        routeid: fav.routeid,
                        directions: [],
                        status: fav.status || [],
                        isLoaded: false,
                        isRefreshing: false, // 新增：是否正在刷新
                        isError: false, // 新增：是否出现错误
                        refreshTimer: null
                    }
                }
                grouped[fav.routeid].directions.push({
                    routeid: fav.routeid,
                    dir: fav.dir,
                    laststation: fav.laststation,
                })
            })
            this.mergedFavourites = Object.values(grouped)
        },
        hasActiveBuses(statusList, dir) {
            // 检查是否有公交在当前方向行驶
            return statusList.some(bus => bus.roadstatus === dir)
        },
        goToRouteDetail(route) {
            // 根据收藏的线路跳转到线路详情页面
            this.$router.push({ path: '/routedetail', query: { id: route.routeid, dir: route.dir } })
        },
        async refreshSingleRoute(routeid) {
            const fav = this.mergedFavourites.find(f => f.routeid === routeid)
            if (fav) {
                fav.isRefreshing = true // 开始刷新
                try {
                    const res = await getBusLiveStatus({ routeid: fav.routeid })
                    const updatedStatus = res.businfos.filter(bus => bus.lastOutSiteMileage != "0")
                    updatedStatus.sort((a, b) => Number(a.stationno) - Number(b.stationno))
                    fav.status = updatedStatus
                    fav.isError = false // 成功后清除错误标记
                } catch (error) {
                    console.error(`获取路线 ${routeid} 状态失败`, error)
                    fav.isError = true // 出现错误
                } finally {
                    fav.isLoaded = true
                    fav.isRefreshing = false // 刷新完成
                }
            }
        },
        async refresh() {
            this.isRefreshing = true
            let errorOccurred = false
            for (let i = 0; i < this.mergedFavourites.length; i++) {
                const fav = this.mergedFavourites[i]
                fav.isRefreshing = true // 开始刷新
                try {
                    if (this.firstLoad) {
                        fav.isLoaded = false
                    }
                    const res = await getBusLiveStatus({ routeid: fav.routeid })
                    const updatedStatus = res.businfos.filter(bus => bus.lastOutSiteMileage != "0")
                    updatedStatus.sort((a, b) => Number(a.stationno) - Number(b.stationno))
                    fav.status = updatedStatus
                    fav.isError = false
                } catch (error) {
                    console.error(`获取路线 ${fav.routename} 状态失败`, error)
                    fav.isError = true
                    errorOccurred = true
                } finally {
                    fav.isLoaded = true
                    fav.isRefreshing = false // 刷新完成
                }
            }
            this.hasError = errorOccurred
            this.firstLoad = false
            this.isRefreshing = false
        },

        fixNo(e) {
            const num = Number(e)
            if (isNaN(num)) {
                return "N/A"
            }
            return num + 1
        },
        fixSpeed(e) {
            const num = Number(e)
            if (isNaN(num)) {
                return "N/A"
            }
            return (num / 10).toFixed(1)
        }
    }
}
</script>
