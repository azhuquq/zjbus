<template>
    <div id="app">
        <v-infinite-scroll :items="noticeItems" :onLoad="onLoad" class="flex flex-col px-2 w-full gap-4">
            <template v-for="(item, index) in noticeItems" :key="item.id">
                <v-card :title="item.name" :subtitle="item.year + item.day" @click="handleCardClick(item)" ref="card" />
            </template>
        </v-infinite-scroll>
        <v-dialog v-model="detailDialog" @afterLeave="handleDetailDialogClose">
            <v-card v-if="loadingStatus.detail">
                <v-card-text class="flex justify-center align-center gap-4">
                    <v-progress-circular indeterminate />
                </v-card-text>
            </v-card>
            <v-card v-else :title="detailData.title" :subtitle="detailData.date" class="whitespace-pre-line">
                <v-card-text v-html="detailData.content" />
                <v-card-actions>
                    <v-btn color="blue" text @click="detailDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { getNoticeIndex, getNoticeDetail } from '@/api/webApi'
export default {
    data() {
        return {
            loadingStatus: {
                list: false,
                detail: false
            },
            detailDialog: false,
            detailData: {},
            noticeItems: [], // 存储公告列表项
            page: 1, // 当前页数
            maxPage: 1, // 总页数
            isLoading: false, // 加载状态
        }
    },
    methods: {
        handleCardClick(item) {
            console.log("🚩 ~ handleCardClick ~ item 👇\n", item)
            this.detailDialog = true
            this.getDetail(item)
        },
        getDetail(item) {
            this.loadingStatus.detail = true
            getNoticeDetail({
                id: item.id
            }).then(res => {
                this.detailData.title = res.data.name
                this.detailData.date = res.data.publish_date
                this.detailData.content = res.data.content
            }).finally(res => {
                this.loadingStatus.detail = false
            })
        },
        handleDetailDialogClose() {
            this.detailData = {}
        },
        async onLoad({ done }) {
            if (this.page > this.maxPage) {
                done('empty')
                return
            }
            if (this.loadingStatus.list === true) {
                return
            }
            this.loadingStatus.list = true
            try {
                const res = await getNoticeIndex({ type: 9, page: this.page })
                // console.log("🚩 ~ onLoad ~ res 👇\n", res)
                if (res.code === 200) {
                    this.noticeItems.push(...res.data.data)
                    this.maxPage = res.page_count
                    this.page++
                    done('ok')
                } else {
                    done('error') // 加载失败
                }
            } catch (error) {
                console.error("加载页面数据时出错:", error)
                done('error') // 通知加载失败
            } finally {
                this.loadingStatus.list = false
            }
        }
    }
}
</script>

<style></style>
