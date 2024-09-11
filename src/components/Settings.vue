<template>
    <v-card title="设置">
        <v-card-text class="flex flex-col justify-between align-center gap-4 w-full">
            <v-list-item title="设置启动页面" class="w-full" @click="launchPage = true">
                <template v-slot:prepend>
                    <v-avatar color="brown">
                        <v-icon icon="ri:external-link-fill" />
                    </v-avatar>
                </template>
            </v-list-item>
            <v-list-item title="刷新缓存" class="w-full">
                <template v-slot:prepend>
                    <v-avatar color="brown">
                        <v-icon>ri:refresh-fill</v-icon>
                    </v-avatar>
                </template>
            </v-list-item>
            <v-list-item title="导入收藏" class="w-full">
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
            </v-list-item>
            <v-list-item title="清除所有数据" class="w-full">
                <template v-slot:prepend>
                    <v-avatar color="brown">
                        <v-icon icon="ri:delete-bin-fill" />
                    </v-avatar>
                </template>
            </v-list-item>
            <v-list-item title="关于应用" class="w-full">
                <template v-slot:prepend>
                    <v-avatar color="brown">
                        <v-icon icon="ri:information-fill" />
                    </v-avatar>
                </template>
            </v-list-item>
        </v-card-text>
    </v-card>

    <!-- 弹窗用于选择启动页 -->
    <v-dialog v-model="launchPage">
        <v-card title="选择启动页">
            <v-card-text>
                <!-- 使用 v-radio-group 让用户选择启动页面 -->
                <v-radio-group v-model="selectedStartPage" column hide-details>
                    <v-radio v-for="option in pageOptions" :key="option.value" :label="option.text" :value="option.value" />
                </v-radio-group>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="saveStartPage">保存</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data() {
        return {
            launchPage: false, // 控制启动页弹窗显示与否
            pageOptions: [
                { text: '所有路线', value: '/' },
                { text: '收藏路线', value: '/favourite' },
                { text: '搜索路线', value: '/search' },
                { text: '公告', value: '/notice' }
            ],
            selectedStartPage: localStorage.getItem('stored_data_startPage') || '/home' // 从 localStorage 获取默认启动页
        }
    },
    methods: {
        // 保存启动页面到 localStorage
        saveStartPage() {
            localStorage.setItem('stored_data_startPage', this.selectedStartPage)
            this.launchPage = false // 关闭弹窗
        }
    }
}
</script>
