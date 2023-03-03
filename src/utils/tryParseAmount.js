import { parseUnits } from '@ethersproject/units'
import { CurrencyAmount, JSBI, Token, TokenAmount } from '@pancakeswap/sdk'

export default (value, currency) => {
    if (!value || !currency) {
        return undefined
    }
    try {
        const typedValueParsed = parseUnits(value, currency.decimals).toString()
    
        if (typedValueParsed !== '0') {
            return currency instanceof Token
                ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
                : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
        }
    } catch (error) {
        console.debug(`Failed to parse input amount: "${value}"`, error)
    }
    return undefined
}