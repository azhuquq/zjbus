<template>
    <div class="text-center">
        <v-bottom-sheet v-model="sheet">
            <v-card class="text-center">
                <v-card-text>
                    <div class="flex flex-col gap-4 py-4 justify-center align-center">
                        <v-alert icon="ri:qr-scan-line" text="" type="info" density="comfortable" variant="tonal"
                            class="w-full" max-width="480px">
                            <strong>按住识别</strong> 该二维码以打开“湛江公交智能出行”小程序
                        </v-alert>

                        <div class="flex justify-center">
                            <QRCodeGenerator text="https://mp.weixin.qq.com/a/~2PfmmpIJRTo--eGNPeuSZQ~~" />
                        </div>
                        <v-alert icon="ri:alarm-warning-line" density="comfortable" text="注意：这不是乘车二维码" type="warning"
                            variant="tonal" class="w-full" max-width="480px"></v-alert>
                    </div>
                </v-card-text>
            </v-card>
        </v-bottom-sheet>
    </div>
</template>

<script>
import QRCodeGenerator from './QRCodeGenerator.vue'
export default {
    components: {
        QRCodeGenerator
    },
    data() {
        return {
            sheet: false,
        }
    },
    methods: {
        openSheet() {
            this.sheet = true
        },
        closeSheet() {
            this.sheet = false
        }
    }
}
</script>
