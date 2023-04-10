<template>
<div class="ConnectWallet">
    <el-button @click="connect" type="primary" :plain="isConnect">
        {{ label }}
    </el-button>
</div>
</template>
<script>

import useWeb3Connect from '@/use/Web3Connect'
import { computed } from 'vue'

export default {
    setup() {

        const Web3Connect = useWeb3Connect()

        const account = Web3Connect.account

        const isConnect = computed(() => {
            return !!account.value.address
        })

        const label = computed(() => {
            return isConnect.value ? 'Connected' : 'Connect Wallet'
        })
        
        const connect = async () => {
            if(isConnect.value) {
                return
            }
            await window.ethereum.request({method: 'eth_requestAccounts'})
            location.reload()
        }

        return {
            connect,
            isConnect,
            label,
        }
    },
}
</script>