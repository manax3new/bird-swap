import { Field } from '@/state/swap/actions'
import { basisPointsToPercent } from '.'
import { JSBI, Percent, TokenAmount, CurrencyAmount } from '@pancakeswap/sdk'
import {
    BLOCKED_PRICE_IMPACT_NON_EXPERT,
    ALLOWED_PRICE_IMPACT_HIGH,
    ALLOWED_PRICE_IMPACT_LOW,
    ALLOWED_PRICE_IMPACT_MEDIUM,
} from '@/constant/config'

const BASE_FEE = new Percent(JSBI.BigInt(25), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

export const multiplyPriceByAmount = (price, amount, significantDigits = 18) => {
    if (!price) {
        return 0
    }

    return parseFloat(price.toSignificant(significantDigits)) * amount
}

export function computeSlippageAdjustedAmounts(
    trade,
    allowedSlippage,
) {
    const pct = basisPointsToPercent(allowedSlippage)
    return {
        [Field.INPUT]: trade?.maximumAmountIn(pct),
        [Field.OUTPUT]: trade?.minimumAmountOut(pct),
    }
}

export function formatExecutionPrice(trade, inverted) {
    if (!trade) {
      return ''
    }
    return inverted
        ? `${trade.executionPrice.invert().toSignificant(6)} ${trade.inputAmount.currency.symbol} / ${
            trade.outputAmount.currency.symbol
        }`
        : `${trade.executionPrice.toSignificant(6)} ${trade.outputAmount.currency.symbol} / ${
            trade.inputAmount.currency.symbol
        }`
}

export function computeTradePriceBreakdown(trade) {
    
    const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
        trade.route.pairs.reduce(
                (currentFee) => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
                ONE_HUNDRED_PERCENT,
            ),
        )

    const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined

    const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
        ? new Percent(priceImpactWithoutFeeFraction?.numerator, priceImpactWithoutFeeFraction?.denominator)
        : undefined

    const realizedLPFeeAmount =
        realizedLPFee &&
        trade &&
        (trade.inputAmount instanceof TokenAmount
            ? new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
            : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount.raw).quotient))

    return { priceImpactWithoutFee: priceImpactWithoutFeePercent, realizedLPFee: realizedLPFeeAmount }
}

export function warningSeverity(priceImpact) {
    if (!priceImpact?.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4
    if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3
    if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2
    if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1
    return 0
}
