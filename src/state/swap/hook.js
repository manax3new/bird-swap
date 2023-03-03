import useWeb3Connect from '@/use/Web3Connect'
import { useCurrencyBalances } from '@/state/wallet/hooks'
import { Field } from '@/state/swap/actions'
import tryParseAmount from '@/utils/tryParseAmount'
import { useTradeExactIn, useTradeExactOut } from '@/use/Trades'
import { isAddress } from '@/utils'
import { computeSlippageAdjustedAmounts } from '@/utils/prices'
import { useUserSlippageTolerance } from '@/state/user/hook'

const BAD_RECIPIENT_ADDRESSES = [
    '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
    '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // v2 router 02
]

function involvesAddress(trade, checksummedAddress) {
    return (
        trade.route.path.some((token) => token.address === checksummedAddress) ||
        trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
    )
  }

export async function useDerivedSwapInfo(independentField, typedValue, inputCurrency, outputCurrency) {

    const Web3Connect = useWeb3Connect()
    const account = Web3Connect.account
    
    const to = account.value.address

    const relevantTokenBalances = await useCurrencyBalances(account.value, [inputCurrency, outputCurrency])
    const isExactIn = independentField === Field.INPUT
    const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

    const bestTradeExactIn = await useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
    const bestTradeExactOut = await useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)

    const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

    const currencyBalances = {
        [Field.INPUT]: relevantTokenBalances[0],
        [Field.OUTPUT]: relevantTokenBalances[1],
    }

    const currencies = {
        [Field.INPUT]: inputCurrency ?? undefined,
        [Field.OUTPUT]: outputCurrency ?? undefined,
    }

    let inputError
    if (!account.value) {
        inputError = 'Connect Wallet'
    }

    if (!parsedAmount) {
        inputError = inputError ?? 'Enter an amount'
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
        inputError = inputError ?? 'Select a token'
    }

    const formattedTo = isAddress(to)
    if (!to || !formattedTo) {
        inputError = inputError ?? 'Enter a recipient'
    } else if (
        BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
        (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
        (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
        inputError = inputError ?? 'Invalid recipient'
    }

    const [ allowedSlippage ] = useUserSlippageTolerance()

    const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage.value)

    const [balanceIn, amountIn] = [
        currencyBalances[Field.INPUT],
        slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
    ]

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
        inputError = `Insufficient ${amountIn.currency.symbol} balance`
    }

    return {
        currencies,
        currencyBalances,
        parsedAmount,
        v2Trade: v2Trade ?? undefined,
        slippageAdjustedAmounts,
        inputError,
    }
}