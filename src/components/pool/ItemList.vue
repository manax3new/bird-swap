<template>
<div class="PoolItemList">
    <el-card>
        <div class="item-list-header flex justify-content-space-around">
            <div>
                <div v-if="isStaked" class="text-small text-primary">
                    STAKED
                </div>
                <div>
                    <div class="text-medium text-bold">
                        {{ title }}
                    </div>
                    <div class="text-small">
                        {{ subtitle }}
                    </div>
                </div>
            </div>
            <div>
                <div class="text-small text-bold">
                  <strong>  {{ earningTokenSymbol }} Earned</strong>
                </div>
                <div class="text-medium" :class="{'text-primary': hasEarnings, 'text-gray': !hasEarnings}">
                    {{ hasEarnings ? numeralNumberFormat(earningTokenBalance, 5) : numeralNumberFormat(earningTokenBalance, 1) }}
                </div>
                <div class="text-small">
                    ~{{ earningTokenDollarBalance ? numeralNumberFormat(earningTokenDollarBalance) : '0.00' }} USD
                </div>
            </div>
            <div>
                <div v-if="isManualCakePool">
                    <div class="text-small text-bold">
                        <strong>{{ CAKE_TOKEN_INFO.symbol }} staked</strong>
                    </div>
                    <div class="text-medium" :class="{'text-primary': hasStaked, 'text-gray': !hasStaked}">
                        {{ hasStaked ? numeralNumberFormat(stakedTokenBalance, 5) : numeralNumberFormat(stakedTokenBalance, 1) }}
                    </div>
                    <div v-if="stakedTokenDollarBalance" class="text-small">
                        ~{{ numeralNumberFormat(stakedTokenDollarBalance) }} USD
                    </div>
                </div>
                <div v-else>
                    <div class="text-small text-bold">
                        Total staked
                    </div>
                    <div>
                        {{ totalStakedBalance }} {{ stakingToken.symbol }}
                    </div>
                </div>
                
            </div>
            <div>
                <div class="text-small text-bold">
                    APR
                </div>
                <div>
                    {{ aprDisplay }}%
                    <!-- <Apr :data="farm.apr"></Apr> -->
                </div>
            </div>
            <div>
                <div v-if="isManualCakePool">
                    <div class="text-small text-bold">
                        Total staked
                    </div>
                    <div>
                        {{ totalStakedBalance }} {{ stakingToken.symbol }}
                    </div>
                </div>
                <div v-else>
                    <EndsInCell :pool="pool"></EndsInCell>
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
                    <EndsInCell :pool="pool" :uiVersion="2"></EndsInCell>
                </div>
                <div>
                    <el-link type="primary" :href="earningToken.projectLink" target="_blank">
                        View Project Site &nbsp;<el-icon><Link /></el-icon>
                    </el-link>
                </div>
                <div>
                    <el-link type="primary" :href="viewAddressOnBscUrl(poolContractAddress)" target="_blank">
                        View Contract &nbsp;<el-icon><Link /></el-icon>
                    </el-link>
                </div>
                <div>
                    <el-button @click="addEarningTokenToMetamask" type="primary" link>
                        Add to Metamask &nbsp;<el-icon><Plus /></el-icon>
                    </el-button>
                </div>
            </div>
            <el-card>
                <div style="width: 250px;">
                    <HarvestCell 
                    :pool="pool" 
                    :hasEarnings="hasEarnings"
                    :earningTokenBalance="earningTokenBalance"
                    :earningTokenDollarBalance="earningTokenDollarBalance"
                    :isManualCakePool="isManualCakePool"
                    :sousId="sousId"
                    :poolCategory="pool.poolCategory"
                    :earningToken="earningToken"
                    :userData="userData"
                    :earningTokenPrice="earningTokenPrice"></HarvestCell>
                </div>
            </el-card>
            <el-card>
                <div style="width: 250px;">
                    <StakeCell
                    :stakingToken="stakingToken"
                    :stakedBalance="stakedBalance"
                    :stakedTokenBalance="stakedTokenBalance"
                    :stakedTokenDollarBalance="stakedTokenDollarBalance"
                    :sousId="sousId"
                    :earningToken="earningToken"
                    :stakingLimit="stakingLimit"
                    :isFinished="isFinished"
                    :poolCategory="pool.poolCategory"
                    :userData="userData"
                    :stakingTokenPrice="stakingTokenPrice"
                    :pool="pool"></StakeCell>
                </div>
            </el-card>
        </div>
    </el-card>
</div>
</template>
<script>

import { QuestionFilled, ArrowDown, ArrowUp, Link, Plus, Minus } from '@element-plus/icons-vue'
import { reactive, computed } from 'vue'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from '@/utils/bigNumber'
import { CAKE_TOKEN_INFO } from '@/constant/config'
import useWeb3Connect from '@/use/Web3Connect'
import { getBalanceNumber } from '@/utils/formatBalance'
import { numeralNumberFormat } from '@/lib/utils'
import EndsInCell from '@/components/pool/EndsInCell'
import { getAddress } from '@/utils/addressHelpers'
import { viewAddressOnBscUrl } from '@/lib/utils'
import { addTokenToMetamask } from '@/utils'
import HarvestCell from '@/components/pool/HarvestCell'
import StakeCell from '@/components/pool/StakeCell'

export default {
    props: [
        'pool'
    ],
    components: {
        Link,
        Plus,
        EndsInCell,
        HarvestCell,
        StakeCell,
    },
    setup(props) {

        const Web3Connect = useWeb3Connect()
        const account = Web3Connect.account

        const state = reactive({
            isShowDetail: false,
        })

        const sousId = computed(() => {
            return props.pool.sousId
        })
        const earningToken = computed(() => {
            return props.pool.earningToken
        })
        const stakingToken = computed(() => {
            return props.pool.stakingToken
        })
        const userData = computed(() => {
            return props.pool.userData
        })
        const isFinished = computed(() => {
            return props.pool.isFinished
        })
        const earningTokenPrice = computed(() => {
            return props.pool.earningTokenPrice
        })
        const totalStaked = computed(() => {
            return props.pool.totalStaked
        })
        const apr = computed(() => {
            return props.pool.apr
        })
        const stakingTokenPrice = computed(() => {
            return props.pool.stakingTokenPrice
        })
        const contractAddress = computed(() => {
            return props.pool.contractAddress
        })

        const earningTokenSymbol = computed(() => {
            return earningToken.value.symbol
        })
        const stakingTokenSymbol = computed(() => {
            return stakingToken.value.symbol
        })
        const stakedBalance = computed(() => {
            return userData.value?.stakedBalance ? new BigNumber(userData.value.stakedBalance) : BIG_ZERO
        })
        const isStaked = computed(() => {
            return stakedBalance.value.gt(0)
        })
        const isManualCakePool = computed(() => {
            return sousId.value === 0
        })
        const earnings = computed(() => {
            return userData.value?.pendingReward ? new BigNumber(userData.value.pendingReward) : BIG_ZERO
        })
        const hasEarnings = computed(() => {
            return account.value.address && earnings.value.gt(0)
        })
        const earningTokenBalance = computed(() => {
            return getBalanceNumber(earnings.value, earningToken.value.decimals)
        })
        const earningTokenDollarBalance = computed(() => {
            return getBalanceNumber(earnings.value.multipliedBy(earningTokenPrice.value), earningToken.value.decimals)
        })
        const stakedTokenDollarBalance = computed(() => {
            return getBalanceNumber(
                stakedBalance.value.multipliedBy(stakingTokenPrice.value),
                stakingToken.value.decimals,
            )
        })

        const title = computed(() => {
            let title = `Earn ${earningTokenSymbol.value}`
            if(isManualCakePool.value) {
                title = `${CAKE_TOKEN_INFO.symbol}`
            }
            return title
        })

        const subtitle = computed(() => {
            let subtitle = `Stake ${stakingTokenSymbol.value}`
            if(isManualCakePool.value) {
                subtitle = `Earn ${CAKE_TOKEN_INFO.symbol} Stake ${CAKE_TOKEN_INFO.symbol}`
            }
            return subtitle
        })

        const totalStakedBalance = computed(() => {
            let balance = getBalanceNumber(totalStaked.value, stakingToken.value.decimals)
            if(balance) {
                return balance.toFixed(0)
            } else {
                return '0'
            }
        })

        const aprDisplay = computed(() => {
            if(apr.value) {
                return numeralNumberFormat(apr.value)
            }
            return '0.00'
        })

        const hasStaked = computed(() => {
            return account.value.address && stakedBalance.value.gt(0)
        })

        const stakedTokenBalance = computed(() => {
            return getBalanceNumber(stakedBalance.value, stakingToken.value.decimals)
        })

        const poolContractAddress = computed(() => {
            return getAddress(contractAddress.value)
        })

        const toggleShowDetail = () => {
            state.isShowDetail = !state.isShowDetail
        }

        const addEarningTokenToMetamask = () => {
            addTokenToMetamask(earningToken.value)
        }

        return {
            QuestionFilled,
            ArrowDown,
            ArrowUp,
            Link,
            Plus,
            Minus,
            state,
            isStaked,
            toggleShowDetail,
            title,
            subtitle,
            CAKE_TOKEN_INFO,
            earningToken,
            earningTokenSymbol,
            earningTokenBalance,
            hasEarnings,
            earningTokenDollarBalance,
            totalStakedBalance,
            stakingToken,
            aprDisplay,
            isManualCakePool,
            hasStaked,
            stakedTokenBalance,
            stakedTokenDollarBalance,
            poolContractAddress,
            viewAddressOnBscUrl,
            addEarningTokenToMetamask,
            stakedBalance,
            earningTokenPrice,
            userData,
            sousId,
            numeralNumberFormat,
            isFinished,
            stakingTokenPrice,
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
.PoolItemList .el-card__body {
    padding: 0px;
}
.item-list-body .el-card__body {
    padding: 10px!important;
}
</style>