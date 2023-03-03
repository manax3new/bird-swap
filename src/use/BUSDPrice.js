import { currencyEquals, Price, JSBI } from '@pancakeswap/sdk'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import usePair from '@/use/Pair.js'
import PairState from '@/constant/PairState'
import useWeb3Connect from '@/use/Web3Connect'
import { getConstantTokens } from '@/constant/config/tokens'

export default async function useBUSDPrice (currency) {

    const Web3Connect = useWeb3Connect()
    const chainId = Web3Connect.chainId
    const web3 = Web3Connect.getWeb3()
    const Pair = usePair(web3)

    const TOKENS = getConstantTokens()
    const { wbnb, busd } = TOKENS

    const wrapped = wrappedCurrency(currency, chainId.value)
    const bnbTokenPair = [chainId.value && wrapped && currencyEquals(wbnb, wrapped) ? undefined : currency, chainId.value ? wbnb : undefined]
    const busdTokenPair = [wrapped?.equals(busd) ? undefined : wrapped, busd]
    const busdBnbTokenPair = [chainId.value ? wbnb : undefined, busd]
    
    const [[bnbPairState, bnbPair], [busdPairState, busdPair], [busdBnbPairState, busdBnbPair]] = await Promise.all([
        Pair.getPair(bnbTokenPair[0], bnbTokenPair[1]),
        Pair.getPair(busdTokenPair[0], busdTokenPair[1]),
        Pair.getPair(busdBnbTokenPair[0], busdBnbTokenPair[1])
    ]) 
    
    if (!currency || !wrapped || !chainId.value) {
        return undefined
    }
    // handle wbnb/bnb
    if (wrapped.equals(wbnb)) {
        if (busdPair) {
          const price = busdPair.priceOf(wbnb)
          return new Price(currency, busd, price.denominator, price.numerator)
        }
        return undefined
    }
    // handle busd
    if (wrapped.equals(busd)) {
        return new Price(busd, busd, '1', '1')
    }
    const bnbPairBNBAmount = bnbPair?.reserveOf(wbnb)
    const bnbPairBNBBUSDValue = bnbPairBNBAmount && busdBnbPair ? busdBnbPair.priceOf(wbnb).quote(bnbPairBNBAmount).raw : JSBI.BigInt(0)

    // all other tokens
    // first try the busd pair
    if (busdPairState === PairState.EXISTS && busdPair && busdPair.reserveOf(busd).greaterThan(bnbPairBNBBUSDValue)) {
        const price = busdPair.priceOf(wrapped)
        return new Price(currency, busd, price.denominator, price.numerator)
    }
    if (bnbPairState === PairState.EXISTS && bnbPair && busdBnbPairState === PairState.EXISTS && busdBnbPair) {
        if (busdBnbPair.reserveOf(busd).greaterThan('0') && bnbPair.reserveOf(wbnb).greaterThan('0')) {
            const bnbBusdPrice = busdBnbPair.priceOf(busd)
            const currencyBnbPrice = bnbPair.priceOf(wbnb)
            const busdPrice = bnbBusdPrice.multiply(currencyBnbPrice).invert()
            return new Price(currency, busd, busdPrice.denominator, busdPrice.numerator)
        }
    }
    return undefined
}