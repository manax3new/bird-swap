<template>
    <div class="LiquidityCardPreview">
        <el-card v-if="data?.userPoolBalance" class="box-card">
            <h3>LP tokens in your wallet</h3>
            <div class="flex justify-content-space-between align-items-center">
                <div v-if="data.currency0 && data.currency1" class="flex align-items-center">
                    <el-space :size="2">
                        <TokenIcon :size="18" :token="data.currency0"></TokenIcon>
                        <TokenIcon :size="18" :token="data.currency1"></TokenIcon>
                        <div class="text-bold">
                            {{data.currency0.symbol}}/{{data.currency1.symbol}} LP
                        </div>
                    </el-space>
                </div>
                <div class="text-align-right">
                    <div>{{data.userPoolBalance.toSignificant(4)}}</div>
                    <div class="text-small">(~{{numberFormat(data.totalUSDValue)}} USD)</div>
                </div>
            </div>
            <div class="vertical-space-10"></div>
            <div class="flex justify-content-space-between">
                <div class="text-bold">Share of Pool:</div>
                <div>{{poolTokenPercentageFormat(data.poolTokenPercentage)}}%</div>
            </div>
            <div class="vertical-space-10"></div>
            <div v-if="data.currency0" class="flex justify-content-space-between">
                <div class="text-bold">Pooled {{data.currency0.symbol}}:</div>
                <div>{{tokenBalanceFormat(data.token0Deposited)}}</div>
            </div>
            <div class="vertical-space-10"></div>
            <div v-if="data.currency1" class="flex justify-content-space-between">
                <div class="text-bold">Pooled {{data.currency1.symbol}}:</div>
                <div>{{tokenBalanceFormat(data.token1Deposited)}}</div>
            </div>
        </el-card>
    </div>
</template>
<script>

import useLiquidityInfo from '@/use/LiquidityInfo'
import { onMounted, watch } from 'vue'
import TokenIcon from '@/components/TokenIcon'

export default {
    props: [
        'pair'
    ],
    components: {
        TokenIcon,
    },
    setup(props) {

        const {
            data,
            loadData,
            poolTokenPercentageFormat,
            tokenBalanceFormat,
            numberFormat
        } = useLiquidityInfo()

        watch(() => props.pair, () => {
            loadData(props.pair)
        })

        onMounted(() => {
            loadData(props.pair)
        })

        return {
            data,
            poolTokenPercentageFormat,
            tokenBalanceFormat,
            numberFormat,
        }
    }
}
</script>