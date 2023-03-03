<template>
<div class="FarmActionsStakedLP">
    <div class="flex justify-content-space-between align-items-center">
        <div>
            <div>
                {{displayBalance}}
            </div>
            <div class="text-x-small">
                {{balanceLpPrice}}
            </div>
            <div class="text-x-small">
                {{tokenLiquidity}} {{tokenSymbol}} {{quouteTokenLiquidity}} {{quoteTokenSymbol}}
            </div>
        </div>
    </div>
</div>
</template>
<script>

import { BigNumber } from 'bignumber.js'
import { computed } from 'vue'
import { getFullDisplayBalance, getBalanceAmount, getBalanceNumber } from '@/utils/formatBalance'
import { useLpTokenPrice } from '@/state/farms/hook'

export default {
    props: [
        'stakedBalance',
        'lpSymbol',
        'quoteTokenSymbol',
        'tokenSymbol',
        'lpTotalSupply',
        'tokenAmountTotal',
        'quoteTokenAmountTotal',
    ],
    setup(props) {

        const displayBalance = computed(() => {
            const stakedBalanceBigNumber = getBalanceAmount(props.stakedBalance)
            if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
                return stakedBalanceBigNumber.toFixed(10, BigNumber.ROUND_DOWN)
            }
            if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0001)) {
                return getFullDisplayBalance(props.stakedBalance).toLocaleString()
            }
            return stakedBalanceBigNumber.toFixed(3, BigNumber.ROUND_DOWN)
        })

        const lpPrice = computed(() => {
            return useLpTokenPrice(props.lpSymbol)
        })

        const balanceLpPrice = computed(() => {
            return `~${getBalanceNumber(lpPrice.value.times(props.stakedBalance)).toFixed(2)} USD`
        })

        const tokenLiquidity = computed(() => {
            return props.stakedBalance.div(props.lpTotalSupply).times(props.tokenAmountTotal).toNumber().toFixed(2)
        })
        const quouteTokenLiquidity = computed(() => {
            return props.stakedBalance.div(props.lpTotalSupply).times(props.quoteTokenAmountTotal).toNumber().toFixed(2)
        })

        return {
            displayBalance,
            balanceLpPrice,
            tokenLiquidity,
            quouteTokenLiquidity,
        }
    }
}
</script>