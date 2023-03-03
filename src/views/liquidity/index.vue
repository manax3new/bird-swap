<template>
    <div class="Pool flex-center">
        <el-card>
            <div class="flex justify-content-space-between">
                <div>
                    <div class="text-x-large text-bold">Your Liquidity</div>
                    <div>Remove liquidity to receive tokens back</div>
                </div>
                <div>
                    <SettingButton></SettingButton>
                </div>
            </div>
            <el-divider />
            <div class="text-align-center" v-if="loadingPair">
                Loading...
            </div>
            <div v-else>
                <div v-for="(pair, key) of pairs" :key="key">
                    <LiquidityCard :pair="pair"></LiquidityCard>
                    <br>
                </div>
                <br>
                <div class="text-align-center">
                    <div>Don't see a pool you joined?</div>
                    <div class="vertical-space-10"></div>
                    <div>
                        <el-button @click="goFindLiquidity" type="primary" plain>Find other Lp tokens</el-button>
                    </div>
                </div>
            </div>
            <div class="vertical-space-10"></div>
            <el-divider />
            <div>
                <el-button class="custom-button-100percent" @click="goAddLiquidity" type="primary">AddLiquidity</el-button>
            </div>
        </el-card>
    </div>
</template>
<script>

import store from '@/store'
import { onMounted, ref } from 'vue'
import { getAllTokens } from '@/use/TokenList'
import { getAllPairs } from '@/use/PairList'
import useParseSdkEntity from '@/use/ParseSdkEntity'
import useERC20 from '@/use/ERC20.js'
import LiquidityCard from '@/components/LiquidityCard'
import usePair from '@/use/Pair'
import { useRouter } from 'vue-router'
import useWeb3Connect from '@/use/Web3Connect'
import SettingButton from '@/components/SettingButton'

export default {
    components: {
        LiquidityCard,
        SettingButton,
    },
    setup() {
        const Web3Connect = useWeb3Connect()
        const web3 = Web3Connect.getWeb3()
        const pairs = ref([])
        const loadingPair = ref(false)

        const ParseSdkEntity = useParseSdkEntity()
        const ERC20 = useERC20(web3)
        const Pair = usePair(web3)

        const router = useRouter()

        const goAddLiquidity = () => {
            router.push({name: 'AddLiquidity'})
        }
        const goFindLiquidity = () => {
            router.push({name: 'FindLiquidity'})
        }
        
        onMounted(async () => {

            const account = store.state.account

            loadingPair.value = true

            const tokens = await getAllTokens()
            const trackedTokenPairs = getAllPairs(tokens)
            const tokenPairsWithLiquidityTokens = trackedTokenPairs.map((tokens) => {
                return {
                    tokens,
                    liquidityToken: ParseSdkEntity.toLiquidityToken(...tokens)
                }
            })

            let getBalanceProcessCount = 0 
            tokenPairsWithLiquidityTokens.map(async (pair) => {
                const balance = await ERC20.balanceOf(pair.liquidityToken.address, account.address)
                if(parseInt(balance) > 0) {
                    const pairBalance = ParseSdkEntity.createTokenAmount(pair.liquidityToken, balance)
                    const pairEntity = (await Pair.getPair(pair.tokens[0], pair.tokens[1]))[1]
                    pairs.value.push(Object.assign(pair, {pairBalance, pairEntity}))
                }
                getBalanceProcessCount++
                if(getBalanceProcessCount === tokenPairsWithLiquidityTokens.length) {
                    loadingPair.value = false
                }
            })
        })

        return {
            pairs,
            loadingPair,
            goAddLiquidity,
            goFindLiquidity,
        }
    }
}
</script>
<style scoped>
</style>