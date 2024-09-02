<template>
    <div id="app">
        <v-infinite-scroll :items="noticeItems" :onLoad="onLoad">
            <template v-for="(item, index) in noticeItems" :key="item.id">
                <div class="notice-item">
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.publish_date }}</p>
                </div>
            </template>
        </v-infinite-scroll>
    </div>
</template>

<script>
import { getNoticeIndex } from '@/api/webApi'
export default {
    data() {
        return {
            noticeItems: [], // 存储公告列表项
            page: 1, // 当前页数
            maxPage: 1, // 总页数
            isLoading: false, // 加载状态
        }
    },
    methods: {
        async onLoad({ done }) {
            if (this.page > this.maxPage) {
                done('empty');
                return;
            }
            this.isLoading = true;

            try {
                const res = await getNoticeIndex({ type: 9, page: this.page });
                if (res.code === 200) {
                    this.noticeItems.push(...res.data.data); // 合并数据
                    this.maxPage = res.page_count; // 更新最大页数
                    this.page++; // 更新页数
                    done('ok'); // 通知加载成功
                } else {
                    done('error'); // 加载失败
                }
            } catch (error) {
                console.error("加载页面数据时出错:", error);
                done('error'); // 通知加载失败
            } finally {
                this.isLoading = false;
            }
        }
    }
}
</script>

<style>
.notice-item {
    padding: 10px;
    border-bottom: 1px solid #e0e0e0;
}
</style>
