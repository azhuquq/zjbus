<template>
    <div id="app">
        <v-app-bar elevation="1">
            <v-app-bar-title>搜索</v-app-bar-title>
        </v-app-bar>
        <div class="flex flex-col gap-2">
            <v-text-field v-model="startPointOrRouteName" label="路线名称/上车点" hide-details @input="handleSearch" />
            <v-text-field v-if="startPointOrRouteName && startPointOrRouteName != ''" v-model="endPoint" label="下车点（可选）"
                hide-details @input="handleSearch" />

            <div v-if="startPointOrRouteName && startPointOrRouteName != ''" class="flex flex-col gap-2">
                <div v-if="searchResults.length === 0">
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
                输入路线名称或上车点以开始搜索
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Search',
    mounted() {
        this.handleSearch()
    },
    data() {
        return {
            startPointOrRouteName: '',  // 保存用户输入的站点名称或路线名称
            endPoint: '',
            searchResults: [],
            loadingStatus: false
        }
    },
    methods: {
        handleSearch() {
            if (this.startPointOrRouteName) {
                this.loadingStatus = true // 开启loading
                const routes = localStorage.getItem('routes') ? JSON.parse(localStorage.getItem('routes')) : {}
                const linesData = routes.lineinfos || []

                if (!Array.isArray(linesData) || linesData.length === 0) {
                    this.searchResults = []
                    this.loadingStatus = false
                    return
                }

                // 如果输入了终点站，则只根据上车点和下车点匹配，不根据路线名称匹配
                this.searchResults = this.findBusRoute(this.startPointOrRouteName, this.endPoint, linesData)
                this.loadingStatus = false
            } else {
                this.searchResults = []
            }
        },
        findBusRoute(startStationOrRoute, endStation, linesData) {
            const matchingRoutes = []
            const seenRoutes = new Set()

            // 1. 如果有终点站，只根据上车点和终点站匹配
            if (endStation && endStation !== '') {
                linesData.forEach((line) => {
                    const busStations = line.busstation
                    const matchingStartStations = busStations.filter(station => station.stationname.includes(startStationOrRoute))
                    const matchingEndStations = busStations.filter(station => station.stationname.includes(endStation))

                    matchingStartStations.forEach(start => {
                        matchingEndStations.forEach(end => {
                            const startStationNo = Number(start.stationno)
                            const endStationNo = Number(end.stationno)

                            if (endStationNo > startStationNo) {
                                const uniqueKey = `${line.roadid}-${line.roadstatus}`
                                if (!seenRoutes.has(uniqueKey)) {
                                    seenRoutes.add(uniqueKey)
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
                })
            } else {
                // 2. 如果没有终点站，优先根据路线名称匹配，然后根据上车点匹配
                linesData.forEach((line) => {
                    // 优先匹配路线名称
                    if (line.roadname.includes(startStationOrRoute)) {
                        const uniqueKey = `${line.roadid}-${line.roadstatus}`
                        if (!seenRoutes.has(uniqueKey)) {
                            seenRoutes.add(uniqueKey)
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

                // 其次匹配上车点
                linesData.forEach((line) => {
                    const busStations = line.busstation
                    const matchingStartStations = busStations.filter(station => station.stationname.includes(startStationOrRoute))

                    matchingStartStations.forEach(start => {
                        const uniqueKey = `${line.roadid}-${line.roadstatus}`
                        if (!seenRoutes.has(uniqueKey)) {
                            seenRoutes.add(uniqueKey)
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
                })
            }

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
