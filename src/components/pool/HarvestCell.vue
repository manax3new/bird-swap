<template>
<div class="HarvestCell">
    <div class="text-small">
        {{ earningToken.symbol }} EARNED
    </div>
    <div class="flex justify-content-space-between align-items-center">
        <div v-if="hasEarnings">
            <div class="text-medium" :class="{'text-primary': hasEarnings, 'text-gray': !hasEarnings}">
                {{ hasEarnings ? numeralNumberFormat(earningTokenBalance, 5) : numeralNumberFormat(earningTokenBalance, 1) }}
            </div>
            <div class="text-small">
                ~{{ earningTokenDollarBalance ? numeralNumberFormat(earningTokenDollarBalance, 2) : '0.00' }} USD
            </div>
        </div>
        <div v-else>
            <div class="text-medium text-gray">
                0
            </div>
            <div class="text-small text-gray">
                0 USD
            </div>
        </div>
        <div>
            <el-button type="primary" @click="toHavest" :disabled="!canHarvest">
                {{ labelButton }}
            </el-button>
        </div>
    </div>

    <CollectModal 
    :visible="collectModal.visible"
    :formattedBalance="formattedBalance"
    :fullBalance="fullBalance"
    :earningToken="earningToken"
    :earningsDollarValue="earningTokenDollarBalance"
    :sousId="sousId"
    :isBnbPool="isBnbPool"
    :isCompoundPool="isCompoundPool"
    @closed="() => { collectModal.visible = false }"></CollectModal>

</div>
</template>
<script>

import { computed, reactive } from 'vue'
import useWeb3Connect from '@/use/Web3Connect'
import CollectModal from '@/components/pool/CollectModal'
import { BIG_ZERO } from '@/utils/bigNumber.js'
import BigNumber from 'bignumber.js'
import { getFullDisplayBalance, formatNumber } from '@/utils/formatBalance'
import { PoolCategory } from '@/constant/config/types'
import { numeralNumberFormat } from '@/lib/utils'

export default {
    props: [
        'pool',
        'hasEarnings',
        'earningTokenBalance',
        'earningTokenDollarBalance',
        'isManualCakePool',
        'sousId',
        'poolCategory',
        'earningToken',
        'userData',
        'earningTokenPrice',
    ],
    components: {
        CollectModal,
    },
    setup(props) {

        const Web3Connect = useWeb3Connect()
        const account = Web3Connect.account

        const collectModal = reactive({
            visible: false,
        })

        const canHarvest = computed(() => {
            if(!account.value.address) {
                return false
            }
            if(props.hasEarnings) {
                return true
            }
            return false
        })

        const labelButton = computed(() => {
            if(props.isManualCakePool) {
                return 'Collect'
            } else {
                return 'Harvest'
            }        
        })

        const earnings = computed(() => {
            return props.userData?.pendingReward ? new BigNumber(props.userData.pendingReward) : BIG_ZERO
        })
        const fullBalance = computed(() => {
            return getFullDisplayBalance(earnings.value, props.earningToken.decimals)
        })
        const formattedBalance = computed(() => {
            return formatNumber(props.earningTokenBalance, 3, 3)
        })
        const isCompoundPool = computed(() => {
            return props.sousId === 0
        })
        const isBnbPool = computed(() => {
            return props.poolCategory === PoolCategory.BINANCE
        })

        const toHavest = () => {
            collectModal.visible = true
        }

        return {
            canHarvest,
            labelButton,
            collectModal,
            toHavest,
            earnings,
            fullBalance,
            formattedBalance,
            isCompoundPool,
            isBnbPool,
            numeralNumberFormat,
        }
    },
}
</script>