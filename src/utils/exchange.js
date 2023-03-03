import { JSBI } from '@pancakeswap/sdk'
import { BIPS_BASE } from '@/constant/Exchange'

export function calculateSlippageAmount(value, slippage) {
    if (slippage < 0 || slippage > 10000) {
      throw Error(`Unexpected slippage value: ${slippage}`)
    }
    return [
      JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), BIPS_BASE),
      JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), BIPS_BASE),
    ]
}