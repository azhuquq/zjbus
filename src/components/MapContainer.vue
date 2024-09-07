<template>
    <div id="container"></div>
</template>

<script>
import AMapLoader from "@amap/amap-jsapi-loader"
import gcoord from 'gcoord'

export default {
    props: {
        busStations: {
            type: Array,
            default: () => []
        },
        liveData: {
            type: Array,
            default: () => []
        },
        finalDir: {
            type: String,
            default: '0'
        },
        selectedStation: {   // 确保 selectedStation 是从父组件传递进来的
            type: Object,
            default: null
        }
    },
    data() {
        return {
            map: null,
            markers: [],
            busMarkers: [],
        }
    },
    mounted() {
        this.loadMap()
        console.log(this.selectedStation)
    },
    beforeUnmount() {
        this.map?.destroy()
    },
    methods: {
        // 加载地图
        loadMap() {
            window._AMapSecurityConfig = {
                securityJsCode: "c1b325c93f9430d31bc33f99d30f8af5"
            }
            AMapLoader.load({
                key: "d01082a70cdd71288c8a1de4f3a6f771", // 申请好的Web端开发者Key
                version: "2.0",
                plugins: ["AMap.Scale", "AMap.InfoWindow"] // 添加 InfoWindow 插件
            })
                .then(AMap => {
                    this.map = new AMap.Map("container", {
                        viewMode: "3D",
                        zoom: 11,
                        center: [110.24, 21.11] // 初始化中心点位置，可以动态设置
                    })
                    this.addMarkers() // 添加站点标记
                    this.addBusMarkers() // 添加公交车标记
                    if (this.selectedStation && this.selectedStation.stationno) {
                        this.showStationDetails(this.selectedStation)
                    }
                })
                .catch(e => {
                    console.log(e)
                })
        },
        // 解析度分格式数据为十进制度
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


        // 添加站点标记到地图
        addMarkers() {
            if (this.map && this.busStations.length > 0) {
                const markers = [] // 用于存储所有站点标记

                this.busStations.forEach(station => {
                    const { lng, lat } = this.parseLatLng(station.lng, station.lat)

                    const convertedCoords = gcoord.transform(
                        [parseFloat(lng), parseFloat(lat)], // WGS84 坐标
                        gcoord.WGS84,                      // 当前坐标系
                        gcoord.GCJ02                       // 高德地图 GCJ-02 坐标系
                    )

                    const content = `
                    <div class="custom-marker">
                        <div class="station-no">${station.stationno}</div>
                    </div>
                    `

                    const marker = new AMap.Marker({
                        position: [convertedCoords[0], convertedCoords[1]],
                        content: content,
                        anchor: 'center',
                        offset: new AMap.Pixel(0, 0),
                        title: station.stationname
                    })

                    markers.push(marker) // 将标记添加到数组中
                    marker.setMap(this.map)
                    this.markers.push(marker)

                    marker.on('click', () => {
                        const infoWindow = new AMap.InfoWindow({
                            content: `<div>${station.stationname}</div>`,
                            anchor: "bottom-center"
                        })
                        infoWindow.open(this.map, marker.getPosition())
                    })
                })

                // 调整视野，使所有标记点在视野内
                this.map.setFitView(markers)
            }
        },

        // 添加符合条件的公交车标记
        addBusMarkers() {
            if (this.map && this.liveData.length > 0) {
                // 过滤 liveData 中 roadstatus 和 finalDir 匹配的车辆
                console.log("🚩 ~ filteredBuses ~ this.finalDir 👇\n", this.finalDir)
                console.log("🚩 ~ filteredBuses ~ this.liveData 👇\n", this.liveData)

                const filteredBuses = this.liveData.filter(bus => bus.roadstatus === this.finalDir)
                console.log("🚩 ~ filteredBuses ~ filteredBuses 👇\n", filteredBuses)

                filteredBuses.forEach(busData => {
                    const { lng, lat } = this.parseLatLng(busData.lng, busData.lat)

                    const convertedCoords = gcoord.transform(
                        [parseFloat(lng), parseFloat(lat)], // WGS84 坐标
                        gcoord.WGS84,                      // 当前坐标系
                        gcoord.GCJ02                       // 高德地图 GCJ-02 坐标系
                    )

                    const busMarker = new AMap.Marker({
                        position: [convertedCoords[0], convertedCoords[1]],
                        // 使用自定义的SVG图标
                        content: `
                                    <div class="custom-bus-marker">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                            <path fill="#FFFFFF" d="M17 20H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1H3v-8H2V8h1V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3h1v4h-1v8h-1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zM5 5v9h14V5zm0 11v2h4v-2zm10 0v2h4v-2z"/>
                                        </svg>
                                    </div>
                                `,
                        anchor: 'center',
                        offset: new AMap.Pixel(0, 0),
                        title: `车牌号: ${busData.busplate}, 车速: ${busData.speed} km/h`
                    })

                    busMarker.setMap(this.map)
                    this.busMarkers.push(busMarker)

                    busMarker.on('click', () => {
                        const infoWindow = new AMap.InfoWindow({
                            // isCustom: true, //使用自定义窗体
                            content: `<div>车牌号: ${busData.busplate}<br/>车速: ${this.fixSpeed(busData.speed)} km/h<br/>更新时间: ${busData.gpssendtime} km/h</div>`,
                            anchor: "bottom-center"
                        })
                        infoWindow.open(this.map, busMarker.getPosition())
                    })
                })
            }
        },
        // 展示选中的站点详细信息
        showStationDetails(station) {
            const { lng, lat } = this.parseLatLng(station.lng, station.lat)
            const convertedCoords = gcoord.transform(
                [parseFloat(lng), parseFloat(lat)], // WGS84 坐标
                gcoord.WGS84,                      // 当前坐标系
                gcoord.GCJ02                       // 高德地图 GCJ-02 坐标系
            )
            // 将地图中心设置为选中站点
            this.map.setCenter([convertedCoords[0], convertedCoords[1]])
            // 调整地图缩放等级到合适的范围，例如放大到15级
            this.map.setZoom(15) // 你可以根据需要调整这个数字
            const infoWindow = new AMap.InfoWindow({
                content: `<div>${station.stationname}</div>`,
                anchor: "bottom-center"
            })
            infoWindow.open(this.map, marker.getPosition())
        },
        
        fixSpeed(e) {
            const num = Number(e)
            if (isNaN(num)) {
                return "N/A"
            }
            return (num / 10).toFixed(1)
        }
    },
    watch: {
        // 监控 busStations 数据的变化，重新添加标记点
        busStations(newStations) {
            if (this.map) {
                this.markers.forEach(marker => marker.setMap(null)) // 清除之前的标记
                this.markers = []
                this.addMarkers() // 重新添加标记
            }
        },
        // 监控 liveData 数据的变化，重新添加公交车标记
        liveData(newLiveData) {
            if (this.map) {
                this.busMarkers.forEach(marker => marker.setMap(null)) // 清除之前的公交车标记
                this.busMarkers = []
                this.addBusMarkers() // 重新添加公交车标记
            }
        },
        selectedStation(newStation) {
            if (newStation) {
                this.$nextTick(() => {
                    this.showStationDetails(newStation)  // 当 selectedStation 改变时调用 showStationDetails
                })
            }
        }
    }
}
</script>

<style>
#container {
    width: 100%;
    height: 100%;
}

/* 自定义站点标记样式 */
.custom-marker {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    background-color: #2196F3;
    /* 蓝色背景 */
    border-radius: 50%;
    color: white;
    /* 白色文字 */
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    line-height: 24px;
}

/* 自定义公交车标记样式 */
.custom-bus-marker {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #E91E63;
    border-radius: 50%;
    color: white;
    /* 白色文字 */
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    line-height: 24px;
}

.info {
    background-color: #fff;
    text-align: center;
    padding: 10px;
    position: relative;
    border: 1px solid #b9b9b9;
}
</style>
