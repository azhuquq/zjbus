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
            </v-list-item>
            <v-list-item title="导出收藏" class="w-full">
                <template v-slot:prepend>
                    <v-avatar color="brown">
                        <v-icon icon="ri:export-fill" />
                    </v-avatar>
                </template>
            </v-list-item> -->
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
                <v-btn color="primary" text @click="retryFetchRoutes">重新获取</v-btn>
            </v-card-actions>
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
            forceUpdateTitle: '刷新缓存中',
            forceUpdateDialog: false,
            isForceUpdateFail: false,
            wipeDataDialog: false
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
        }
    }
}
</script>
