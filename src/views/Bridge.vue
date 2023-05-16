<template>
    <div class="Bridge">
        
        <h1>Bridge</h1>

        <div>
            <div>
                chainA
            </div>
            <div v-if="chainA.chain">
                <div>
                    {{ chainA.chain.name }}
                </div>
                <div>
                    {{ chainA.tokenBalance }} wei
                </div>
            </div>
        </div>
        <br>
        <div>
            <div>
                chainB
            </div>
            <div v-if="chainB.chain">
                <div>
                    {{ chainB.chain.name }}
                </div>
                <div>
                    {{ chainB.tokenBalance }} wei
                </div>
            </div>
        </div>

    </div>
</template>
<script>

import { getTokenBalance } from '@/state/bridge'
import useWeb3Connect from '@/use/Web3Connect'
import { onMounted, reactive, ref } from 'vue'
import CHAIN from '@/constant/Chain'
import { TOKENS } from '@/constant/Bridge.js'
const SELECT_TOKEN = 'usdt'


export default {
    setup() {

        const Web3Connect = useWeb3Connect()
        const account = Web3Connect.account

        const chainA = reactive({
            chain: null,
            token: null,
            tokenBalance: 0,
        })

        const chainB = reactive({
            chain: null,
            token: null,
            tokenBalance: 0,
        })

        const fetchTokenInfo = async (chainId, token) => {
            const balances = await getTokenBalance(chainId, token.address, account.value.address)
            const balance = balances[0]
            return {
                balance,
            }
        }

        const fetchAll = async () => {

            chainA.token = TOKENS[CHAIN.bnbTestnet.chainId][SELECT_TOKEN]
            chainA.chain = CHAIN.bnbTestnet
            chainB.token = TOKENS[CHAIN.ethereumMainnet.chainId][SELECT_TOKEN]
            chainB.chain = CHAIN.ethereumMainnet
            // chainB.token = TOKENS[CHAIN.sepoliaTestnet.chainId][SELECT_TOKEN]
            // chainB.chain = CHAIN.sepoliaTestnet
            
            const tokenAInfo = await fetchTokenInfo(chainA.chain.chainId, chainA.token)
            chainA.tokenBalance = tokenAInfo.balance
            const tokenBInfo = await fetchTokenInfo(chainB.chain.chainId, chainB.token)
            chainB.tokenBalance = tokenBInfo.balance
        }

        onMounted(() => {
            fetchAll()
        })

        return {
            chainA,
            chainB,
        }
    }
}
</script>
