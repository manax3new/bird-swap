import { Token, TokenAmount, Currency, CurrencyAmount, Pair } from '@pancakeswap/sdk'
import { parseUnits } from '@ethersproject/units'
import LPTOken from '@/constant/LPToken'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import useWeb3Connnect from '@/use/Web3Connect.js'
const Web3Connect = useWeb3Connnect()
const chainId = Web3Connect.chainId

export default () => {
    
    const createToken = (rawTokenObject) => {
        return new Token(rawTokenObject.chainId, rawTokenObject.address, rawTokenObject.decimals, rawTokenObject.symbol, rawTokenObject.name)
    }

    const createCurrency = (rawTokenObject) => {
        return new Currency(rawTokenObject.decimals, rawTokenObject.symbol, rawTokenObject.name)
    }

    const createCurrencyAmount = (currency, amount) => {
        return new CurrencyAmount(currency, amount.toString())
    }

    const createTokenAmount = (token, amount) => {
        return new TokenAmount(token, amount.toString())
    }

    const fastCreateTokenAmount = (rawTokenObject, rawAmount) => {
        const amount = parseUnits(rawAmount.toString(), rawTokenObject.decimals)
        let token = null
        token = wrappedCurrency(rawTokenObject, chainId.value)
        if(!token) {
            token = createToken(rawTokenObject)
        }
        const currency = createCurrency(rawTokenObject)
        const currencyAmount = createCurrencyAmount(currency, amount)
        const tokenAmount = new TokenAmount(token, currencyAmount.raw)
        return tokenAmount
    }

    const createPair = (tokenA, tokenB, reserve0, reserve1) => {
        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
        return new Pair(new TokenAmount(token0, reserve0.toString()),new TokenAmount(token1, reserve1.toString()) )
    }

    const toLiquidityToken = (tokenA, tokenB) => {
        return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB), 18, LPTOken.symbol, LPTOken.name)
    }

    return {
        createToken,
        createCurrency,
        createCurrencyAmount,
        createTokenAmount,
        fastCreateTokenAmount,
        createPair,
        toLiquidityToken,
    }
}