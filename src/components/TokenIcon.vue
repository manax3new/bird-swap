<template>
<div class="TokenIcon">
    <el-avatar :size="size" :src="imageSrc" />
</div>
</template>
<script>

import { getTokenInfo } from '@/use/TokenList'
import {ETHER} from '@pancakeswap/sdk'
import { toRaw, computed } from 'vue'
import { appBaseUrl } from '@/constant/config/Env'

export default {
    props: [
        'size',
        'token',
    ],
    setup(props) {
        const imageSrc = computed(() => {
            if(!props.token) {
                return ''
            }
            if(toRaw(props.token) === ETHER) {
                return `${appBaseUrl}/images/BNBTokenIcon.png`
            }
            const tokenInfo = getTokenInfo(props.token.address) 
            if(!tokenInfo) {
                return ''
            }
            return tokenInfo.logoURI
        })

        return {
            imageSrc,
        }
    },
}
</script>