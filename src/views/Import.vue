<template>
    <div id="app">
        <v-app-bar elevation="1">
            <v-btn icon @click="goHome()">
                <v-icon>ri:home-line</v-icon>
            </v-btn>
            <v-app-bar-title>
                导入收藏数据
            </v-app-bar-title>
        </v-app-bar>
        <div v-if="favouritesData && favouritesData.length > 0">
            <div class="flex flex-col gap-2 align-center">
                <div v-for="(item, index) in favouritesData" :key="index" class="w-full">
                    <v-card>
                        <v-card-text>
                            <div class="flex flex-row align-center justify-between"
                                @click="item.selected = !item.selected">
                                <div class="text-xl font-bold">
                                    {{ item.title }}
                                </div>
                                <div>
                                    <v-checkbox v-model="item.selected" hide-details></v-checkbox>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </div>
                <v-btn @click="importSelectedFavourites" append-icon="ri:arrow-down-line" color="primary" rounded="xl"
                    :disabled="selectedFavourites === 0" size="large">{{ selectedFavourites === 0 ?
                        '导入选中的数据'
                        : `导入选中的${selectedFavourites}个数据` }}</v-btn>
            </div>
        </div>
        <div v-else>
            <v-alert icon="ri:error-warning-line" text="不妨检查一下导入链接是否复制全了（？" title="没有要导入的数据" type="error"></v-alert>
        </div>
        <v-dialog v-model="importDialog">
            <v-card :title="importDialogTitle" :text="importDialogText">
                <v-card-actions>
                    <v-btn @click="goHome()" color="primary">返回主页</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            importDialog: false,
            favouritesData: [],
            newDataLength: 0,
            importDialogTitle: '',
            importDialogText: ''
        }
    },
    computed: {
        selectedFavourites() {
            return this.favouritesData.filter(item => item.selected).length || 0
        }
    },
    mounted() {
        this.importFavourites()
    },
    methods: {
        goHome() {
            this.$router.push('/')
        },
        importFavourites() {
            try {
                const encodedData = this.$route.query.data
                if (encodedData) {
                    const decodedURI = decodeURIComponent(encodedData)
                    const base64Decoded = atob(decodedURI)
                    const uint8Array = new Uint8Array([...base64Decoded].map(c => c.charCodeAt(0)))
                    const jsonString = new TextDecoder().decode(uint8Array)
                    const favouritesData = JSON.parse(jsonString)
                    this.favouritesData = favouritesData.map(item => ({ ...item, selected: true }))
                } else {
                    this.favouritesData = []
                    throw new Error('没有找到有效的导入数据')
                }
            } catch (error) {
                this.favouritesData = []
            }
        },
        importSelectedFavourites() {
            const selectedData = this.favouritesData.filter(item => item.selected)
            if (selectedData.length > 0) {
                const storedData = JSON.parse(localStorage.getItem('stored_data_favouriteRoutes')) || []
                const nonDuplicateData = selectedData.filter(newItem => {
                    return !storedData.some(storedItem => storedItem.routeid === newItem.routeid && storedItem.dir === newItem.dir)
                })
                const newDataLength = nonDuplicateData.length
                if (newDataLength === 0) {
                    this.importDialogTitle = "没有要导入的新数据"
                    this.importDialogText = "所有数据都已在收藏中"
                } else {
                    const updatedData = [...storedData, ...nonDuplicateData]
                    localStorage.setItem('stored_data_favouriteRoutes', JSON.stringify(updatedData))
                    this.importDialogTitle = "已导入新数据"
                    this.importDialogText = `已导入${newDataLength}个数据`
                }
                this.importDialog = true
            }
        }
    }
}
</script>
