<template>
<div class="BackButton">
    <el-button @click="goBack" :icon="Back" circle></el-button>
</div>
</template>
<script>

import { Back } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

export default {
    props: [
        'to',
    ],
    setup(props) {

        const router = useRouter()

        const goBack = () => {
            
            if(props.to) {
                router.push(props.to)
            } else {
                router.back()
            }
        }

        return {
            Back,
            goBack,
        }
    },
}
</script>