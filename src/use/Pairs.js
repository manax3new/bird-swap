import useWeb3Connect from '@/use/Web3Connect'
import { wrappedCurrency }  from '@/utils/wrappedCurrency'
import { Pair, TokenAmount } from '@pancakeswap/sdk'
import usePair from '@/use/Pair'
import PAIR_STATE from '@/constant/PairState'
const PairState = PAIR_STATE

export async function usePairs(currencies) {

    const Web3Connect = useWeb3Connect()
    const pairHook = usePair()
    const chainId = Web3Connect.chainId

    const tokens = currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId.value),
        wrappedCurrency(currencyB, chainId.value)
    ])

    const pairAddressesFn = () => {
        return tokens.map(([tokenA, tokenB]) => {
            try {
                return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
            } catch (error) {
                console.error(
                    error.msg,
                    `- pairAddresses: ${tokenA?.address}-${tokenB?.address}`,
                    `chainId: ${tokenA?.chainId}`,
                )
                return undefined
            }
        })
    }
    const pairAddresses = pairAddressesFn()

    const getReserveTasks = []
    for(const pairAddress of pairAddresses) {
        getReserveTasks.push(pairHook.getReserve(pairAddress))
    }

    const results = await Promise.all(getReserveTasks)

    return results.map((result, i) => {
        const reserves = result
        const tokenA = tokens[i][0]
        const tokenB = tokens[i][1]
        if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
        if (!reserves) return [PairState.NOT_EXISTS, null]
        const { reserve0, reserve1 } = reserves
        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
        return [
            PairState.EXISTS,
            new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),
        ]

    })
}