<template>
    <div v-if="canShow">
        <el-button @click="addToMetamask" link circle>
            <MetamaskIcon></MetamaskIcon>
        </el-button>
        <el-tooltip
            :visible="isCopiedToClipboard"
            class="box-item"
            effect="dark"
            content="Copied"
            placement="top">
            <el-button @click="copyToClipboard" @mouseleave="isCopiedToClipboard = false" :icon="CopyDocument" link circle class="no-padding no-margin">
            </el-button>
        </el-tooltip>
    </div>
</template>
<script>

import { computed, toRaw, ref } from 'vue'
import { ETHER } from '@pancakeswap/sdk'
import { addTokenToMetamask } from '@/utils'
import MetamaskIcon from '@/components/MetamaskIcon'
import { CopyDocument } from '@element-plus/icons-vue'

export default {
    props: [
        'token'
    ],
    components: {
        MetamaskIcon,
    },
    setup(props) {

        const isCopiedToClipboard = ref(false)

        const canShow = computed(() => {
            if(!props.token) {
                return false
            }
            if(toRaw(props.token) === ETHER) {
                return false
            }
            return true
        })

        const addToMetamask = () => {
            addTokenToMetamask(props.token)
        }
        
        const copyToClipboard = () => {
            navigator.clipboard.writeText(props.token.address)
            isCopiedToClipboard.value = true
        }

        return {
            canShow,
            addToMetamask,
            CopyDocument,
            copyToClipboard,
            isCopiedToClipboard,
        }
    },
}
</script>