<template>
    <div id="app">
        <v-app-bar elevation="1">
            <v-app-bar-title>通知&公告</v-app-bar-title>
            <template v-slot:append>
                <v-btn icon="ri:information-line" @click="aboutDialog = true"></v-btn>
            </template>
        </v-app-bar>
        <NetworkErr v-if="networkErr" />
        <v-infinite-scroll :items="noticeItems" :onLoad="onLoad" class="flex flex-col w-full gap-4"
            style="margin-top: -16px !important;">
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
        <!-- 懒得连自己的后端服务器/serverless，直接写死算了 -->
        <v-dialog v-model="aboutDialog">
            <v-card title="关于“湛江实时公交查询”项目" subtitle="阿朱@2024-09-04">
                <v-card-text class="flex flex-col gap-4">
                    <div>本项目由阿朱基于Vue3、Vite、Vuetify、TailwindCSS、Iconify、Vercel等框架开发</div>
                    <div>阿朱官网: <a href="http://azhuquq.com">azhuquq.com</a></div>
                    <div>微信: azhuquq (是本人，欢迎交流！)</div>
                    <div>邮箱: i@azhuquq.com</div>
                    <div>所有数据均来源于“湛江公交”微信公众号、“湛江市公共交通有限公司”网站等公开数据，阿朱不对数据真实性及完整性负责。</div>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="blue" text @click="aboutDialog = false">关闭</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { getNoticeIndex, getNoticeDetail } from '@/api/webApi'
import NetworkErr from '@/components/NetworkErr.vue'
export default {
    components: { NetworkErr },
    data() {
        return {
            networkErr: false,
            aboutDialog: false,
            toggle_none: null,
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
            this.networkErr = false
            getNoticeDetail({
                id: item.id
            }).then(res => {
                console.log("🚩 ~ getDetail ~ res 👇\n", res)
                this.detailData.title = res.data.name
                this.detailData.date = res.data.publish_date
                // 替换图片地址前缀
                this.detailData.content = res.data.content.replace(/http:\/\/www\.zhjgongjiao\.com\/uploads\//g, '/webimg/')
            }).catch(err => {
                this.networkErr = true
            }).finally(() => {
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
            this.networkErr = false
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
                this.networkErr = true
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
