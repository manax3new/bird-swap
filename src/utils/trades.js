import { currencyEquals } from '@pancakeswap/sdk'
import { ZERO_PERCENT, ONE_HUNDRED_PERCENT } from '@/constant/config'

export function isTradeBetter(
    tradeA,
    tradeB,
    minimumDelta = ZERO_PERCENT,
) {
    if (tradeA && !tradeB) return false
    if (tradeB && !tradeA) return true
    if (!tradeA || !tradeB) return undefined

    if (
        tradeA.tradeType !== tradeB.tradeType ||
        !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
        !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency)
    ) {
        throw new Error('Trades are not comparable')
    }

    if (minimumDelta.equalTo(ZERO_PERCENT)) {
        return tradeA.executionPrice.lessThan(tradeB.executionPrice)
    }
    return tradeA.executionPrice.raw.multiply(minimumDelta.add(ONE_HUNDRED_PERCENT)).lessThan(tradeB.executionPrice)
}

export default isTradeBetter