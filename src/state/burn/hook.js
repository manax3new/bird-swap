import useWeb3Connect from "@/use/Web3Connect";
import usePair from '@/use/Pair'
import useTokenBalance from '@/use/TokenBalance'
import useTotalSupply from '@/use/TotalSupply'
import { JSBI, TokenAmount, Percent } from '@pancakeswap/sdk'
import tryParseAmount from '@/utils/tryParseAmount'

export async function useDerivedBurnInfo(currencyA, currencyB, independentField, typedValue) {

    const burnInfo = {
        pair: null,
        parsedAmounts: {
            LIQUIDITY_PERCENT: null,
            LIQUIDITY: null,
            CURRENCY_A: null,
            CURRENCY_B: null,
        }
    }

    const Web3Connect = useWeb3Connect()
    const account = Web3Connect.getAccount()

    const tokenA = currencyA
    const tokenB = currencyB

    const pairHook = usePair()

    const [, pair] = await pairHook.getPair(currencyA, currencyB)
    if(!pair) {
        return burnInfo
    }
    burnInfo.pair = pair

    const userLiquidity = await useTokenBalance(pair.liquidityToken, account)

    const tokens = {
        CURRENCY_A: tokenA,
        CURRENCY_B: tokenB,
        LIQUIDITY: pair?.liquidityToken,
    }

    const totalSupply = await useTotalSupply(pair.liquidityToken)

    const liquidityValueA =
        pair &&
        totalSupply &&
        userLiquidity &&
        tokenA &&
        JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
        ? new TokenAmount(tokenA, pair.getLiquidityValue(tokenA, totalSupply, userLiquidity, false).raw)
        : undefined

    const liquidityValueB =
        pair &&
        totalSupply &&
        userLiquidity &&
        tokenB &&
        JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
        ? new TokenAmount(tokenB, pair.getLiquidityValue(tokenB, totalSupply, userLiquidity, false).raw)
        : undefined

    const liquidityValues = {
        CURRENCY_A: liquidityValueA,
        CURRENCY_B: liquidityValueB,
    }

    let percentToRemove = new Percent('0', '100')

    if (independentField === 'LIQUIDITY_PERCENT') {
        percentToRemove = new Percent(typedValue, '100')
    } else if (independentField === 'LIQUIDITY') {
        if (pair?.liquidityToken) {
            const independentAmount = tryParseAmount(typedValue, pair.liquidityToken)
            if (independentAmount && userLiquidity && !independentAmount.greaterThan(userLiquidity)) {
                percentToRemove = new Percent(independentAmount.raw, userLiquidity.raw)
            }
        }
    } else if (tokens[independentField]) {
        const independentAmount = tryParseAmount(typedValue, tokens[independentField])
        const liquidityValue = liquidityValues[independentField]
        if (independentAmount && liquidityValue && !independentAmount.greaterThan(liquidityValue)) {
            percentToRemove = new Percent(independentAmount.raw, liquidityValue.raw)
        }
    }
    
    burnInfo.parsedAmounts = {
        LIQUIDITY_PERCENT: percentToRemove,
        LIQUIDITY: userLiquidity && percentToRemove && percentToRemove.greaterThan('0')
            ? new TokenAmount(userLiquidity.token, percentToRemove.multiply(userLiquidity.raw).quotient)
            : undefined,
        CURRENCY_A: tokenA && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueA
            ? new TokenAmount(tokenA, percentToRemove.multiply(liquidityValueA.raw).quotient)
            : undefined,
        CURRENCY_B: tokenB && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueB
            ? new TokenAmount(tokenB, percentToRemove.multiply(liquidityValueB.raw).quotient)
            : undefined,
    }

    return burnInfo
}