<template>

</template>

<script>
import { searchRoute } from '@/api/wechatApi'
export default {
    data() {
        return {
        }
    },
    computed: {
    },
    mounted() {
        this.fetchSearchData()
    },
    methods: {
        fetchSearchData() {
            searchRoute().then(data => {
                console.log(data)
            })
        }
    }
}
</script>
