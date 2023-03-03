
import store from '@/store'
import useTotalSupply from '@/use/TotalSupply'
import useTokenBalance from '@/use/TokenBalance'
import { reactive } from 'vue'
import { Percent, Pair } from '@pancakeswap/sdk'
import { poolTokenPercentageFormat, tokenBalanceFormat, numberFormat } from '@/lib/utils'
import useBUSDPrice from '@/use/BUSDPrice'
import { unwrappedToken } from '@/utils/wrappedCurrency'
import { multiplyPriceByAmount } from '@/utils/prices'

export default () => {

    const data = reactive({
        userPoolBalance: null,
        token0Deposited: null,
        token1Deposited: null,
        poolTokenPercentage: null,
        totalUSDValue: null,
        currency0: null,
        currency1: null,
    })

    const loadData = async (pair) => {

        let pairEntity
        if(pair instanceof Pair) {
            pairEntity = pair
        } else {
            pairEntity = pair.pairEntity
        }

        const totalPoolTokens = await useTotalSupply(pairEntity.liquidityToken)
        const userPoolBalance = await useTokenBalance(pairEntity.liquidityToken, store.state.account)

        data.userPoolBalance = userPoolBalance
        data.token0Deposited = pairEntity.getLiquidityValue(pairEntity.token0, totalPoolTokens, userPoolBalance, false)
        data.token1Deposited = pairEntity.getLiquidityValue(pairEntity.token1, totalPoolTokens, userPoolBalance, false)
        data.poolTokenPercentage = new Percent(userPoolBalance.raw, totalPoolTokens.raw)

        const currency0 = unwrappedToken(pairEntity.token0)
        const currency1 = unwrappedToken(pairEntity.token1)

        data.currency0 = currency0
        data.currency1 = currency1

        const token0Price = await useBUSDPrice(currency0)
        const token1Price = await useBUSDPrice(currency1)

        const token0USDValue =
        data.token0Deposited && token0Price
        ? multiplyPriceByAmount(token0Price, parseFloat(data.token0Deposited.toSignificant(6)))
        : null

        const token1USDValue =
        data.token1Deposited && token1Price
        ? multiplyPriceByAmount(token1Price, parseFloat(data.token1Deposited.toSignificant(6)))
        : null

        data.totalUSDValue = token0USDValue && token1USDValue ? token0USDValue + token1USDValue : null
    }

    return {
        data,
        loadData,
        poolTokenPercentageFormat,
        tokenBalanceFormat,
        numberFormat,
    }
}

