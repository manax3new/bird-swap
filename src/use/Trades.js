import useWeb3Connect from '@/use/Web3Connect'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import flatMap from 'lodash/flatMap'
import { usePairs } from '@/use/Pairs'
import PAIR_STATE from '@/constant/PairState'
import { Trade } from '@pancakeswap/sdk'
import isTradeBetter from '@/utils/trades'
import {
    BASES_TO_CHECK_TRADES_AGAINST,
    CUSTOM_BASES,
    BETTER_TRADE_LESS_HOPS_THRESHOLD,
    ADDITIONAL_BASES,
} from '@/constant/config'
const PairState = PAIR_STATE

export async function useAllCommonPairs(currencyA, currencyB) {

    const Web3Connect = useWeb3Connect()
    const chainId = Web3Connect.chainId

    const [tokenA, tokenB] = chainId.value
        ? [wrappedCurrency(currencyA, chainId.value), wrappedCurrency(currencyB, chainId.value)]
        : [undefined, undefined]

    const common = BASES_TO_CHECK_TRADES_AGAINST[chainId.value] ?? []
    const additionalA = tokenA ? ADDITIONAL_BASES[chainId.value]?.[tokenA.address] ?? [] : []
    const additionalB = tokenB ? ADDITIONAL_BASES[chainId.value]?.[tokenB.address] ?? [] : []

    const bases = [...common, ...additionalA, ...additionalB]

    const basePairs = flatMap(bases, (base) => bases.map((otherBase) => [base, otherBase]))

    const allPairCombinationsFn = () => {
        if (tokenA && tokenB) {
            return [
                // the direct pair
                [tokenA, tokenB],
                // token A against all bases
                ...bases.map((base) => [tokenA, base]),
                // token B against all bases
                ...bases.map((base) => [tokenB, base]),
                // each base against all bases
                ...basePairs,
            ]
                .filter((tokens) => Boolean(tokens[0] && tokens[1]))
                .filter(([t0, t1]) => t0.address !== t1.address)
                .filter(([tokenA_, tokenB_]) => {
                    if (!chainId.value) return true
                    const customBases = CUSTOM_BASES[chainId.value]

                    const customBasesA = customBases?.[tokenA_.address]
                    const customBasesB = customBases?.[tokenB_.address]

                    if (!customBasesA && !customBasesB) return true

                    if (customBasesA && !customBasesA.find((base) => tokenB_.equals(base))) return false
                    if (customBasesB && !customBasesB.find((base) => tokenA_.equals(base))) return false

                    return true
                })
        } else {
            return []
        }
    }

    const allPairCombinations = allPairCombinationsFn()

    const allPairs = await usePairs(allPairCombinations)

    return Object.values(
        allPairs
            // filter out invalid pairs
            .filter((result) => Boolean(result[0] === PairState.EXISTS && result[1]))
            // filter out duplicated pairs
            .reduce((memo, [, curr]) => {
                memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
                return memo
            }, {}),
    )
}

const MAX_HOPS = 3

export async function useTradeExactIn(currencyAmountIn, currencyOut) {

    const allowedPairs = await useAllCommonPairs(currencyAmountIn?.currency, currencyOut)

    const singleHopOnly = false

    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
        if (singleHopOnly) {
            return (
                Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 1, maxNumResults: 1 })[0] ??
                null
            )
        }
        // search through trades with varying hops, find best trade out of them
        let bestTradeSoFar = null
        for (let i = 1; i <= MAX_HOPS; i++) {
            const currentTrade =
                Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: i, maxNumResults: 1 })[0] ??
                null
            // if current trade is best yet, save it
            if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
                bestTradeSoFar = currentTrade
            }
        }
        return bestTradeSoFar
    }

    return null
}

export async function useTradeExactOut(currencyIn, currencyAmountOut) {

    const allowedPairs = await useAllCommonPairs(currencyIn, currencyAmountOut?.currency)

    const singleHopOnly = false

    if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
        if (singleHopOnly) {
            return (
                Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: 1, maxNumResults: 1 })[0] ??
                null
            )
        }
        // search through trades with varying hops, find best trade out of them
        let bestTradeSoFar = null
        for (let i = 1; i <= MAX_HOPS; i++) {
            const currentTrade =
                Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: i, maxNumResults: 1 })[0] ??
                null
            if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
                bestTradeSoFar = currentTrade
            }
        }
        return bestTradeSoFar
    }
    return null
}