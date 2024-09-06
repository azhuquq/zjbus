<template>
    <div>
        <v-app-bar elevation="1">
            <v-app-bar-title>收藏路线</v-app-bar-title>
            <template v-slot:append>
                <div v-if="isRefreshing" class="me-2">
                    <!-- 显示进度圆圈 -->
                    <v-progress-circular indeterminate />
                </div>
                <div v-else>
                    <!-- 显示刷新按钮 -->
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
        <div v-else class="flex flex-col gap-4">
            <!-- 如果任一线路请求失败，显示网络错误组件 -->
            <NetworkErr v-if="hasError" class="my-2" />
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
                                                        ${fixSpeed(bus.speed)} km/h ${bus.busplate}` }}
                                                    </v-chip>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <!-- 当前方向没有活动车辆 -->
                                        <v-chip class="p-2" label color="secondary">
                                            <v-icon icon="ri:signpost-line" start />
                                            无活动车辆
                                        </v-chip>
                                    </template>
                                </div>
                                <div v-else>
                                    <!-- 当前线路没有状态 -->
                                    <v-chip class="p-2" label color="secondary">
                                        <v-icon icon="ri:signpost-line" start />
                                        无活动车辆
                                    </v-chip>
                                </div>
                            </template>
                            <div v-else>
                                <!-- 未加载完成时显示未知 -->
                                <v-chip class="p-2" color="orange" label>
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
            firstLoad: true, // 新增标志：判断是否首次加载
            isRefreshing: false, // 标志是否正在刷新
            hasError: false // 标志是否有网络错误
        }
    },
    mounted() {
        // 从 localStorage 中读取收藏的线路，并进行合并
        this.favourites = JSON.parse(localStorage.getItem('favouriteRoutes')) || []
        this.mergeFavourites() // 初始化合并收藏路线
        this.refresh() // 初次加载时自动刷新
    },
    methods: {
        mergeFavourites() {
            const grouped = {}
            this.favourites.forEach(fav => {
                if (!grouped[fav.routeid]) {
                    grouped[fav.routeid] = {
                        routename: fav.routename,
                        routeid: fav.routeid,
                        directions: [],
                        status: fav.status || [], // 确保每个 route 有 status 属性
                        isLoaded: false, // 新增标志：是否加载完成
                    }
                }
                grouped[fav.routeid].directions.push({
                    routeid: fav.routeid,
                    dir: fav.dir,
                    laststation: fav.laststation,
                    title: fav.title
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
        async refresh() {
            this.isRefreshing = true // 开始刷新时设置为 true
            let errorOccurred = false // 用来跟踪是否发生错误

            // 遍历每个收藏的路线（mergedFavourites）
            for (let i = 0; i < this.mergedFavourites.length; i++) {
                const fav = this.mergedFavourites[i]
                try {
                    // 首次刷新时将状态标记为未加载，后续刷新不再更改 isLoaded
                    if (this.firstLoad) {
                        fav.isLoaded = false
                    }
                    // 获取实时状态
                    const res = await getBusLiveStatus({ routeid: fav.routeid })
                    const updatedStatus = res.businfos.filter(bus => bus.lastOutSiteMileage != "0")
                    updatedStatus.sort((a, b) => Number(a.stationno) - Number(b.stationno))
                    // 更新状态并标记为加载成功
                    fav.status = updatedStatus
                    fav.isLoaded = true
                } catch (error) {
                    console.error(`获取路线 ${fav.routename} 状态失败`, error)
                    // 如果发生错误，设置 errorOccurred 为 true
                    errorOccurred = true
                    fav.isLoaded = true
                }
            }

            // 如果发生了任意错误，将 hasError 设为 true，否则设为 false
            this.hasError = errorOccurred

            // 刷新完成后，标志为非首次加载
            this.firstLoad = false
            this.isRefreshing = false // 刷新完成后设置为 false
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
