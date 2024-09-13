<template>
    <v-card title="设置">
        <v-card-text class="flex flex-col justify-between align-center gap-4 w-full">
            <v-list-item title="刷新缓存" class="w-full" @click="refreshCache()">
                <template v-slot:prepend>
                    <v-avatar color="brown">
                        <v-icon>ri:refresh-fill</v-icon>
                    </v-avatar>
                </template>
            </v-list-item>
            <!-- <v-list-item title="导入收藏" class="w-full">
                <template v-slot:prepend>
                    <v-avatar color="brown">
                        <v-icon icon="ri:import-fill" />
                    </v-avatar>
                </template>
            </v-list-item>-->
            <v-list-item title="导出收藏" class="w-full" @click="handleClickExport()">
                <template v-slot:prepend>
                    <v-avatar color="brown">
                        <v-icon icon="ri:export-fill" />
                    </v-avatar>
                </template>
            </v-list-item>
            <v-list-item title="清除所有数据" class="w-full" @click="wipeDataDialog = true">
                <template v-slot:prepend>
                    <v-avatar color="brown">
                        <v-icon icon="ri:delete-bin-fill" />
                    </v-avatar>
                </template>
            </v-list-item>
            <!-- <v-list-item title="关于应用" class="w-full">
                <template v-slot:prepend>
                    <v-avatar color="brown">
                        <v-icon icon="ri:information-fill" />
                    </v-avatar>
                </template>
            </v-list-item> -->
        </v-card-text>
    </v-card>
    <v-dialog v-model="forceUpdateDialog">
        <v-card :title="forceUpdateTitle">
            <v-card-text>
                <v-progress-circular indeterminate v-if="!isForceUpdateFail" />
                <div v-else>不妨试试重新加载？当然也很有可能是中转服务器/接口出错了（悲）</div>
            </v-card-text>
            <v-card-actions v-if="isForceUpdateFail">
                <v-btn color="primary" text @click="refreshCache()">重新获取</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="dataExportDialog">
        <v-card title="导出收藏数据">
            <v-card-text>
                <div v-if="!dataExportStatus">{{ dataExportFailureReason }}</div>
                <div v-else class="flex flex-col gap-4">
                    <v-textarea label="导入数据链接" v-model="dataExportResult" readonly hide-details></v-textarea>
                    <div>您可以直接使用该链接来导入数据</div>
                    <div class="flex justify-end">
                        <v-btn color="blue" class="ml-auto" @click="handleCopy(dataExportResult)" rounded="xl">
                            <template v-slot:prepend>
                                <v-icon>ri:file-copy-line</v-icon>
                            </template>
                            复制
                        </v-btn>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
    <v-dialog v-model="wipeDataDialog">
        <v-card title="清除所有数据">
            <v-card-text>
                确定要清除所有数据吗？这将会清空您的收藏列表并重载程序，但也有可能帮助您修复一些问题。
            </v-card-text>
            <v-card-actions>
                <v-btn @click="wipeData" color="red">清除</v-btn>
                <v-btn @click="wipeDataDialog = false">取消</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import { fetchRoutesIfNeeded } from '@/utils/fetchAllRoutes'
export default {
    data() {
        return {
            // 刷新缓存
            forceUpdateTitle: '刷新缓存中',
            forceUpdateDialog: false,
            isForceUpdateFail: false,
            // 导出数据
            dataExportDialog: false,
            dataExportStatus: false,
            dataExportFailureReason: '数据导出失败',
            dataExportResult: '',
            // 清除数据
            wipeDataDialog: false,
            snackbar: {
                text: '',
                open: false
            },
        }
    },
    methods: {
        async refreshCache(forceUpdate = true) {
            try {
                this.forceUpdateTitle = '刷新缓存中'
                this.forceUpdateDialog = true // 打开刷新缓存对话框
                this.isForceUpdateFail = false
                await fetchRoutesIfNeeded(forceUpdate)
                this.$router.go(0)
                this.forceUpdateDialog = false // 关闭刷新缓存对话框
            } catch (error) {
                this.forceUpdateTitle = '刷新缓存失败'
                console.error('刷新缓存失败:', error)
                this.isForceUpdateFail = true
            } finally {
            }
        },
        wipeData() {
            localStorage.clear()
            this.wipeDataDialog = false
            this.$router.push('/')
            this.$router.go(0)
        },
        handleClickExport() {
            this.exportFavourites()
            this.dataExportDialog = true
        },
        exportFavourites() {
            try {
                const favourites = localStorage.getItem('stored_data_favouriteRoutes')
                console.log("🚩 ~ exportFavourites ~ favourites 👇\n", favourites)
                if (favourites) {
                    const jsonFavourites = JSON.stringify(JSON.parse(favourites))
                    const utf8Favourites = new TextEncoder().encode(jsonFavourites)
                    const base64Favourites = btoa(String.fromCharCode(...utf8Favourites))
                    const encodedFavourites = encodeURIComponent(base64Favourites)
                    const exportUrl = `${window.location.hostname}/import?data=${encodedFavourites}`
                    this.dataExportStatus = true
                    this.dataExportResult = exportUrl
                } else {
                    this.dataExportStatus = false
                    this.dataExportFailureReason = '无收藏数据'
                    console.warn('没有找到收藏数据')
                }
            } catch (error) {
                this.dataExportStatus = false
                this.dataExportFailureReason = '导出收藏时出错'
                console.error('导出收藏时出错:', error)
            }
        },
        handleCopy(text) {
            if (text) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        const event = new CustomEvent('showSnackbar', { detail: { text: `已复制` } })
                        window.dispatchEvent(event)
                        console.log('Text copied to clipboard:', text)
                    })
                    .catch(err => {
                        console.error('Failed to copy text:', err)
                    })
            }
        },
    }
}
</script>
