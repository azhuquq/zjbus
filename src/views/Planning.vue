<template>
    <div id="app">
        <v-app-bar elevation="1">
            <v-app-bar-title>搜索站点</v-app-bar-title>
        </v-app-bar>
        <div class="flex flex-col gap-2">
            <!-- "在哪里上车？" 的输入框 -->
            <v-text-field v-model="startPoint" label="在哪里上车？" hide-details @input="handleInputChange" />

            <!-- 只有在 startPoint 不为空时才显示 "在哪里下车？" 的输入框 -->
            <v-text-field
                v-if="startPoint && startPoint != ''"
                v-model="endPoint"
                label="在哪里下车？"
                hide-details
                @input="handleSearch"
            />

            <div v-if="startPoint && startPoint != ''" class="flex flex-col gap-2">
                <div class="w-full flex justify-center mt-16" v-if="loadingStatus === true">
                    <v-progress-circular indeterminate />
                </div>
                <div v-else-if="searchResults.length === 0">
                    <v-empty-state icon="ri:inbox-line" title="找不到结果"></v-empty-state>
                </div>
                <div v-else v-for="(item, index) in searchResults" :key="index">
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
                输入站点名称以开始搜索
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Planning',
    mounted() {
        this.handleSearch()
    },
    data() {
        return {
            startPoint: '',
            endPoint: '',
            searchResults: [], // 保存搜索结果
            loadingStatus: false // 加入loading状态
        }
    },
    methods: {
        handleInputChange() {
            if (!this.startPoint) {
                // 如果 startPoint 为空，清空 endPoint
                this.endPoint = ''
            }
            this.handleSearch()
        },
        handleSearch() {
            if (this.startPoint) {
                this.loadingStatus = true // 开启loading
                const routes = localStorage.getItem('routes') ? JSON.parse(localStorage.getItem('routes')) : {}
                const linesData = routes.lineinfos || [] // 提取lineinfos中的线路信息

                // 如果 lineinfos 是空数组，则跳过搜索
                if (!Array.isArray(linesData) || linesData.length === 0) {
                    this.searchResults = [] // 没有找到线路，清空结果
                    this.loadingStatus = false // 关闭loading
                    return
                }

                this.searchResults = this.findBusRoute(this.startPoint, this.endPoint, linesData)
                this.loadingStatus = false // 关闭loading
            } else {
                this.searchResults = []
            }
        },
        findBusRoute(startStation, endStation, linesData) {
            const matchingRoutes = []
            const seenRoutes = new Set() // 用于去重

            linesData.forEach((line) => {
                const busStations = line.busstation
                const matchingStartStations = busStations.filter(station => station.stationname.includes(startStation))

                // 如果没有终点站，直接根据起点站匹配
                if (!endStation || endStation === '') {
                    matchingStartStations.forEach(start => {
                        const uniqueKey = `${line.roadid}-${line.roadstatus}` // 创建唯一键

                        if (!seenRoutes.has(uniqueKey)) {
                            seenRoutes.add(uniqueKey) // 添加到 Set 中以确保唯一性
                            matchingRoutes.push({
                                lastsite: line.lastsite,
                                roadid: line.roadid,
                                roadstatus: line.roadstatus,
                                lasttime: line.lasttime,
                                ticketprice: line.ticketprice,
                                roadname: line.roadname,
                                firstsite: line.firstsite,
                                firsttime: line.firsttime,
                                autooperation: line.autooperation
                            })
                        }
                    })
                } else {
                    const matchingEndStations = busStations.filter(station => station.stationname.includes(endStation))

                    matchingStartStations.forEach(start => {
                        matchingEndStations.forEach(end => {
                            // 将 stationno 转换为数字并比较
                            const startStationNo = Number(start.stationno)
                            const endStationNo = Number(end.stationno)

                            if (endStationNo > startStationNo) {
                                const uniqueKey = `${line.roadid}-${line.roadstatus}` // 创建唯一键

                                if (!seenRoutes.has(uniqueKey)) {
                                    seenRoutes.add(uniqueKey) // 添加到 Set 中以确保唯一性
                                    matchingRoutes.push({
                                        lastsite: line.lastsite,
                                        roadid: line.roadid,
                                        roadstatus: line.roadstatus,
                                        lasttime: line.lasttime,
                                        ticketprice: line.ticketprice,
                                        roadname: line.roadname,
                                        firstsite: line.firstsite,
                                        firsttime: line.firsttime,
                                        autooperation: line.autooperation
                                    })
                                }
                            }
                        })
                    })
                }
            })
            return matchingRoutes
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
