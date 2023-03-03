import useTransactionDeadline from '@/use/TransactionDeadline'
import { Percent, Router, JSBI, TradeType } from '@pancakeswap/sdk'
import { BIPS_BASE } from '@/constant/config'

export async function useSwapCallArguments(trade, allowedSlippage, to) {

	const recipient = to
	const deadline = await useTransactionDeadline()

	const swapMethods = []

	swapMethods.push(
		Router.swapCallParameters(trade, {
			feeOnTransfer: false,
			allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage.value), BIPS_BASE),
			recipient,
			deadline: deadline.toNumber(),
		}),
	)

	if (trade.tradeType === TradeType.EXACT_INPUT) {
		swapMethods.push(
			Router.swapCallParameters(trade, {
				feeOnTransfer: true,
				allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage.value), BIPS_BASE),
				recipient,
				deadline: deadline.toNumber(),
			}),
		)
	}

	return swapMethods
}