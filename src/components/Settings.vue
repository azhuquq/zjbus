<template>
    <v-card title="设置">
        <v-card-text class="flex flex-col justify-between align-center gap-4 w-full">
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
</template>

<script>
export default {
    data() {
        return {
        }
    },
    methods: {
    }
}
</script>
