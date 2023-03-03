import { ETHER, Token, WETH, TokenAmount } from '@pancakeswap/sdk'
import { toRaw } from 'vue'

export function wrappedCurrency(currency, chainId) {
    return chainId && toRaw(currency) === ETHER ? WETH[chainId] : currency instanceof Token ? currency : undefined
}

export function wrappedCurrencyAmount(currencyAmount, chainId) {
    const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
    return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}

export function unwrappedToken(token) {
    if (token.equals(WETH[token.chainId])) return ETHER
    return token
}
