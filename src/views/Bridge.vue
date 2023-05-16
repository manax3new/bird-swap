<template>
    <div class="Bridge">
        
        <h1>Bridge</h1>

    </div>
</template>
<script>

import { getTokenBalance } from '@/state/bridge'
import useWeb3Connect from '@/use/Web3Connect'
import { onMounted, reactive } from 'vue'
import CHAIN from '@/constant/Chain'
import { TOKENS } from '@/constant/Bridge.js'

export default {
    setup() {

        const Web3Connect = useWeb3Connect()
        const account = Web3Connect.account

        const tokenA = reactive({
            chainId: 0,
            token: null,
            balance: 0,
        })

        const fetchTokenInfo = async (chainId, token) => {
            const balance = await getTokenBalance(chainId, token.address, account.value.address)
            return balance
        }

        onMounted(async () => {

            tokenA.chainId = CHAIN.bnbTestnet.chainId
            tokenA.token = TOKENS[CHAIN.bnbTestnet.chainId]['usdt']

            tokenA.balance = await fetchTokenInfo(tokenA.chainId, tokenA.token)    
            console.log('tokenA', tokenA)
        })
    }
}
</script>
