<template>
    <div class="LiquidityCard">
        <el-card v-if="data?.userPoolBalance" class="box-card">
            <div class="flex justify-content-space-between align-items-center">
                <div v-if="data.currency0 && data.currency1">
                    <el-space :size="2">
                        <TokenIcon :size="18" :token="data.currency0"></TokenIcon>
                        <TokenIcon :size="18" :token="data.currency1"></TokenIcon>
                        <div>{{data.currency0.symbol}}/{{data.currency1.symbol}}</div>
                    </el-space>
                </div>
                <div class="text-align-right">
                    <div>{{data.userPoolBalance.toSignificant(4)}}</div>
                    <div class="text-sm">(~{{numberFormat(data.totalUSDValue)}} USD)</div>
                </div>
            </div>
            <div class="vertical-space-10"></div>
            <div class="flex justify-content-space-between">
                <div>Share of Pool:</div>
                <div><strong>{{poolTokenPercentageFormat(data.poolTokenPercentage)}}%</strong></div>
            </div>
            <div class="vertical-space-10"></div>
            <div v-if="data.currency0" class="flex justify-content-space-between">
                <div>Pooled {{data.currency0.symbol}}:</div>
                <div><strong>{{tokenBalanceFormat(data.token0Deposited)}}</strong></div>
            </div>
            <div class="vertical-space-10"></div>
            <div class="flex justify-content-space-between">
                <div>Pooled {{data.currency1.symbol}}:</div>
                <div><strong>{{tokenBalanceFormat(data.token1Deposited)}}</strong></div>
            </div>
            <div class="vertical-space-10"></div>
            <div class="text-align-center">
                <el-button class="custom-button-100percent" @click="goRemove" type="primary">Remove</el-button>
            </div>
            <div class="vertical-space-10"></div>
            <div class="text-align-center">
                <el-button @click="goAddLiquidityInstead" type="primary" link>Add liquidity instead</el-button>
            </div>
        </el-card>
    </div>
</template>
<script>

import useLiquidityInfo from '@/use/LiquidityInfo'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TokenIcon from '@/components/TokenIcon'
import { getCurrencyAddress } from '@/utils'

export default {
    props: [
        'pair'
    ],
    components: {
        TokenIcon,
    },
    setup(props) {

        const router = useRouter()

        const {
            data,
            loadData,
            poolTokenPercentageFormat,
            tokenBalanceFormat,
            numberFormat
        } = useLiquidityInfo()

        const goRemove = () => {
            router.push({name: 'RemoveLiquidity', params: {tokenAAddress: getCurrencyAddress(data.currency0), tokenBAddress: getCurrencyAddress(data.currency1)}})
        }

        const goAddLiquidityInstead = () => {
            const tokenAaddress = getCurrencyAddress(data.currency0)
            const tokenBaddress = getCurrencyAddress(data.currency1)
            router.push({
                name: 'AddLiquidity', 
                params: {
                    tokenAAddress: tokenAaddress, 
                    tokenBAddress: tokenBaddress
                }
            })
        }

        onMounted(async () => {
            await loadData(props.pair)
        })

        return {
            data,
            poolTokenPercentageFormat,
            tokenBalanceFormat,
            numberFormat,
            goRemove,
            goAddLiquidityInstead,
        }
    }
}
</script>