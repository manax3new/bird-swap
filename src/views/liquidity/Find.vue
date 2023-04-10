<template>
    <div class="Find">
        <el-card class="card-fix">
            <router-link :to="{name: 'Liquidity'}">
                <el-button :icon="Back" circle></el-button>
            </router-link>
            <h2 style="margin-bottom: 0px;text-align: center;">Import Pool</h2>
            <h3 class="text-sm" style="text-align: center;margin: 0px 0px 15px 0px;">Import an existing pool</h3>
            <div>
                <SelectTokenButton @selectToken="selectTokenAHandle" :token="data.tokenA" :pairToken="data.tokenB"></SelectTokenButton>
            </div>
            <div style="text-align: center;">
                +
            </div>
            <div>
                <SelectTokenButton @selectToken="selectTokenBHandle" :token="data.tokenB" :pairToken="data.tokenA"></SelectTokenButton>
            </div>
            <br>
            <div>
                <div v-if="data.searchState === 'loading'">
                    Loading...
                </div>
                <div v-else-if="data.searchState === 'done'">
                    <div v-if="data.poolData">
                        <LiquidityCardPreview :pair="data.poolData"></LiquidityCardPreview>
                        <br>
                        <div style="text-align: center;">
                            <el-button @click="addPair" type="primary" plain>Manage this pool</el-button>
                        </div>
                    </div>
                    <div v-else>
                        <div>
                            You don’t have liquidity in this pool yet.
                        </div>
                        <br>
                        <div>
                            <el-button @click="goAddLiquidity" type="primary" plain>Add Liquidity</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>
<script>

import { Back } from '@element-plus/icons-vue'
import SelectTokenButton from '@/components/SelectTokenButton'
import { reactive, computed } from 'vue'
import useParseSdkEntity from '@/use/ParseSdkEntity'
import store from '@/store'
import useERC20 from '@/use/ERC20.js'
import usePair from '@/use/Pair'
import LiquidityCardPreview from '@/components/LiquidityCardPreview'
import { useRouter } from 'vue-router'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import useWeb3Connnect from '@/use/Web3Connect.js'

export default {
    components: {
        SelectTokenButton,
        LiquidityCardPreview,
    },
    setup() {

        const Web3Connect = useWeb3Connnect()
        const chainId = Web3Connect.chainId
        const ParseSdkEntity = useParseSdkEntity()
        const ERC20 = useERC20()
        const Pair = usePair()
        const account = computed(() => {
            return store.state.account
        })
        const router = useRouter()

        const data = reactive({
            tokenA: null,
            tokenB: null,
            poolData: null,
            searchState: 'idle', //idle, loading, done
        })

        const selectTokenAHandle = (value) => {
            data.tokenA = value
            loadPoolData()
        }
        const selectTokenBHandle = (value) => {
            data.tokenB = value
            loadPoolData()
        }

        const loadPoolData = async () => {

            if(!data.tokenA || !data.tokenB) {
                return
            }

            const tokenA = wrappedCurrency(data.tokenA, chainId.value)
            const tokenB = wrappedCurrency(data.tokenB, chainId.value)

            data.searchState = 'loading'

            try {

                const liquidityToken = ParseSdkEntity.toLiquidityToken(tokenA, tokenB)
                const balance = await ERC20.balanceOf(liquidityToken.address, account.value.address)
                if(parseInt(balance) > 0) {
                    const pairBalance = ParseSdkEntity.createTokenAmount(liquidityToken, balance)
                    const pairEntity = (await Pair.getPair(tokenA, tokenB))[1]
                    data.poolData = {
                        tokens: [
                            tokenA,
                            tokenB,
                        ],
                        liquidityToken,
                        pairBalance, 
                        pairEntity
                    }
                } else {
                    data.poolData = null
                }

            } catch (error) {
                console.log('loadPoolData error', error.message)
                data.poolData = null
            }
            data.searchState = 'done'
        }

        const goAddLiquidity = () => {
            router.push({name: 'AddLiquidity'})
        }

        const addPair = () => {

            const tokenA = wrappedCurrency(data.tokenA, chainId.value)
            const tokenB = wrappedCurrency(data.tokenB, chainId.value)

            store.dispatch('addUserSavePairs', [tokenA, tokenB])
            router.push({name: 'Liquidity'})
        }

        return {
            Back,
            data,
            selectTokenAHandle,
            selectTokenBHandle,
            goAddLiquidity,
            addPair,
        }
    }
}
</script>
<style scoped>
.Find {
    display: flex;
    justify-content: center;
}
</style>
