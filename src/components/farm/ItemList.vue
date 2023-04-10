<template>
<div class="FarmItemList">
    <el-card>
        <div class="item-list-header flex justify-content-space-around">
            <div>
                <div v-if="isStaked" class="text-small text-primary">
                    FARMING
                </div>
                <div class="text-bold fnt-16">
                    {{farm.farm.label}}
                </div>
            </div>
            <div>
                <div class="text-small text-bold">
                    Earned
                </div>
                <div>
                    {{farm.earned.earnings.toLocaleString()}}
                </div>
            </div>
            <div>
                <div class="text-small text-bold">
                    APR
                </div>
                <div>
                    <Apr :data="farm.apr"></Apr>
                </div>
            </div>
            <div>
                <div class="flex align-items-center text-small text-bold">
                    <div>
                        Liquidity
                    </div>
                    <div class="horizontal-space-2"></div>
                    <el-tooltip
                        effect="dark"
                        content="Total value of the funds in this farm’s liquidity pool"
                    >
                        <el-icon><QuestionFilled /></el-icon>
                    </el-tooltip>
                </div>
                <div>
                    ${{Number(farm.liquidity.liquidity).toLocaleString(undefined, { maximumFractionDigits: 0 })}}
                </div>
            </div>
            <div>
                <div class="flex align-items-center text-small text-bold">
                    <div>
                        Multipiler
                    </div>
                    <div class="horizontal-space-2"></div>
                    <el-tooltip
                        effect="dark"
                    >
                        <template #content> 
                            <div>
                                The Multiplier represents the proportion of CAKE rewards each farm receives, as a proportion of the CAKE produced each block.
                            </div>
                            <br/>
                            <div>
                                For example, if a 1x farm received 1 CAKE per block, a 40x farm would receive 40 CAKE per block.
                            </div>
                            <br/>
                            <div>
                                This amount is already included in all APR calculations for the farm.
                            </div>
                        </template>
                        <el-icon><QuestionFilled /></el-icon>
                    </el-tooltip>
                </div>
                <div>
                    {{farm.multiplier.multiplier.toLowerCase()}}
                </div>
            </div>
            <div>
                <span style="color: rgb(135 179 225);">Details</span>
                <el-button v-if="state.isShowDetail" @click="toggleShowDetail" type="primary" :icon="ArrowUp" circle link />
                <el-button v-else :icon="ArrowDown" @click="toggleShowDetail" type="primary" circle link />
            </div>
        </div>
        <div v-show="state.isShowDetail" class="flex item-list-body justify-content-space-around">
            <div>
                <div>
                    <el-link type="primary" :href="getLpTokenUrl" target="_blank">
                        Get {{farm.farm.label}} LP &nbsp;<el-icon><Link /></el-icon>
                    </el-link>
                </div>
                <div>
                    <el-link type="primary" :href="contractOnExplorerURL" target="_blank">
                        View Contract &nbsp;<el-icon><Link /></el-icon>
                    </el-link>
                </div>
            </div>
            <el-card>
                <div style="width: 250px;">
                    <div class="text-small">
                        {{CAKE_TOKEN_INFO.symbol}} EARNED
                    </div>
                    <div class="flex justify-content-space-between align-items-center">
                        <div>
                            {{farm.earned.earnings.toLocaleString()}}
                        </div>
                        <div>
                            <el-button 
                            @click="havest"
                            :disabled="(!canHarvest || isOnHavest)" 
                            type="primary" 
                            size="large">
                                {{havestButtonLabel}}
                            </el-button>
                        </div>
                    </div>
                </div>
            </el-card>
            <el-card>
                <div style="width: 250px;">
                    <StakedAction :farm="farm.details" :lpLabel="lpLabel" :displayApr="farm.apr.value"></StakedAction>
                </div>
            </el-card>
        </div>
    </el-card>
</div>
</template>
<script>

import { QuestionFilled, ArrowDown, ArrowUp, Link, Plus, Minus } from '@element-plus/icons-vue'
import { reactive, computed, ref } from 'vue'
import { CAKE_TOKEN_INFO } from '@/constant/config'
import { BLOCK_EXPLORER_BASE_URL } from '@/constant/config/Env'
import useWeb3Connect from '@/use/Web3Connect'
import Apr from '@/components/farm/farmTable/Apr'
import StakedAction from '@/components/farm/actions/StakedAction'
import useHarvestFarm from '@/views/farm/hooks/useHavestFarm'
import { ElNotification } from 'element-plus'
import { callWithGasPriceErrorExtract } from '@/lib/contractErrorExtract'
import store from '@/store'
import { viewTransactionOnBscUrl } from '@/lib/utils.js'
import { toastError } from '@/use/Toast'
import { getCurrencyAddress } from '@/utils'
import { useRouter } from 'vue-router'
import { unwrappedToken } from '@/utils/wrappedCurrency'

export default {
    props: [
        'farm'
    ],
    components: {
        QuestionFilled,
        Link,
        Apr,
        StakedAction,
    },
    setup(props) {

        const Web3Connect = useWeb3Connect()
        const chainId = Web3Connect.chainId
        const router = useRouter()

        const state = reactive({
            isShowDetail: false,
        })

        const isOnHavest = ref(false)

        const toggleShowDetail = () => {
            state.isShowDetail = !state.isShowDetail
        }

        const isStaked = computed(() => {
            return parseFloat(props.farm.details.userData.stakedBalance) > 0
        })

        const canHarvest = computed(() => {
            return parseFloat(props.farm.earned.earnings) > 0
        })

        const contractOnExplorerURL = computed(() => {
            return `${BLOCK_EXPLORER_BASE_URL[chainId.value]}/address/${props.farm.details.lpAddresses[chainId.value]}`
        })

        const lpLabel = computed(() => {
            return props.farm.lpSymbol && props.farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
        })

        const pid = computed(() => {
            return props.farm.details.pid
        })

        const getLpTokenUrl = computed(() => {
            if(!props.farm.details) {
                return ''
            }
            const tokenAaddress = getCurrencyAddress(unwrappedToken(props.farm.details.token))
            const tokenBaddress = getCurrencyAddress(unwrappedToken(props.farm.details.quoteToken))
            const routerData = router.resolve({
                name: 'AddLiquidity', 
                params: {
                    tokenAAddress: tokenAaddress, 
                    tokenBAddress: tokenBaddress
                }
            })
            return routerData.href
        })

        const havestButtonLabel = computed(() => {
            if(isOnHavest.value) {
                return 'Havesting...'
            } else {
                return 'Havest'
            }
        })

        const needFetchFarm = computed(() => {
            return store.state.needFetchFarm
        })

        const havest = async () => {
            isOnHavest.value = true
            const { onReward } = useHarvestFarm(pid.value)
            try {
                const tx = await onReward()
                if(tx) {
                    ElNotification({
                        customClass: 'top-of-every-thing',
                        type: 'success',
                        title: 'Transaction Submitted!',
                        dangerouslyUseHTMLString: true,
                        message: `<a href="${viewTransactionOnBscUrl(tx.hash)}" target="_blank">View on BscScan: ${tx.hash}</a>`,
                        duration: 10 * 1000,
                    })
                }
                const receipt = await tx.wait()
                if (receipt?.status) {
                    ElNotification({
                        customClass: 'top-of-every-thing',
                        type: 'success',
                        title: 'Unstaked',
                        dangerouslyUseHTMLString: true,
                        message: `Your ${CAKE_TOKEN_INFO.symbol} earnings have been sent to your wallet!
                                    <br/>
                                    <a href="${viewTransactionOnBscUrl(receipt.transactionHash)}" target="_blank">View on BscScan: ${receipt.transactionHash}</a>`,
                        duration: 10 * 1000,
                    })
                    store.dispatch('requestForFetchFarm')
                }
            } catch (error) {
                toastError('Error', callWithGasPriceErrorExtract(error.message))
            }
            isOnHavest.value = false
        }

        return {
            ArrowDown,
            ArrowUp,
            Plus,
            Minus,
            state,
            toggleShowDetail,
            isStaked,
            canHarvest,
            CAKE_TOKEN_INFO,
            contractOnExplorerURL,
            lpLabel,
            havest,
            isOnHavest,
            havestButtonLabel,
            needFetchFarm,
            getLpTokenUrl,
        }
    },
}
</script>
<style scoped>
.item-list-header {
    padding: 20px;
}
.item-list-body {
    padding: 20px;
    background-color: #18222c;
    border: solid 1px  #1d3043;
}
</style>
<style>
.FarmItemList .el-card__body {
    padding: 0px;
}
.item-list-body .el-card__body {
    padding: 10px!important;
}
</style>