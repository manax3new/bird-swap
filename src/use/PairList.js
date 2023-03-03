import store from '@/store'
import useParseSdkEntity from '@/use/ParseSdkEntity.js'
import useWeb3Connect from '@/use/Web3Connect'
import { BASE_TOKENS, PINNED_PAIRS } from '@/constant/config'

const ParseSdkEntity = useParseSdkEntity()

const getUserSavePairs = () => {
    const userSavePairsRaw = JSON.parse(store.state.userSavePairs)
    const userSavePairs = userSavePairsRaw.map((tokens) => {
        return [
            ParseSdkEntity.createToken(tokens[0]),
            ParseSdkEntity.createToken(tokens[1]),
        ]
    })
    return userSavePairs
}

const removeDuplicate = (pairs) => {

    let pairMap = {}
    pairs.map((pair) => {
        const tokenA = pair[0]
        const tokenB = pair[1]
        const sorted = tokenA.sortsBefore(tokenB)
        const key = sorted ? `${tokenA.symbol}:${tokenB.symbol}` : `${tokenB.symbol}:${tokenA.symbol}`
        pairMap[key] = pair
    })

    const removeDuplicatePairs = []
    for(const key in pairMap) {
        removeDuplicatePairs.push(pairMap[key])
    }
    return removeDuplicatePairs
}

export const getAllPairs = (tokens) => {

    const Web3Connect = useWeb3Connect()
    const chainId = Web3Connect.chainId

    const baseTokens = BASE_TOKENS[chainId.value]

    const pinnedPairs = PINNED_PAIRS[chainId.value]

    const userSavePairs = getUserSavePairs()

    let generatePairs = []
    baseTokens.map((baseToken) => {
        tokens.map((token) => {
            if(baseToken.address === token.address) {
                generatePairs.push(null)
            } else {
                generatePairs.push([baseToken, token])
            }
        })
    })
    generatePairs = generatePairs.filter((pair) => {
        return pair !== null
    })

    const combinedPairs = pinnedPairs.concat(generatePairs).concat(userSavePairs)

    const pairs = removeDuplicate(combinedPairs)

    return pairs
}