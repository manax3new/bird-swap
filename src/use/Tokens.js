import { getAllTokens } from '@/use/TokenList'
import { GELATO_NATIVE } from '@/constant/config'
import { ETHER, Token } from '@pancakeswap/sdk'
import { isAddress } from '@/utils'
import { getConstantTokens } from '@/constant/config/tokens'
import { useTokenContract2 } from '@/use/Contract'
import { arrayify } from '@ethersproject/bytes'
import { parseBytes32String } from '@ethersproject/strings'
import useWeb3Connect from '@/use/Web3Connect'

export const useToken = async (tokenAddress) => {
    const TOKENS = getConstantTokens()
    const constantTokens = []
    for(const TOKEN in TOKENS) {
        constantTokens.push(TOKENS[TOKEN])
    }
    let tokens = await getAllTokens()
    tokens = tokens.concat(constantTokens)
    const address = isAddress(tokenAddress)
    if(!address) {
        return null
    }
    const token = tokens.find((token) => {
        return token.address.toUpperCase() === address.toUpperCase()
    })
    return token ? token : null
}

export const useCurrency = async (currencyId) => {
    const isBNB = currencyId?.toUpperCase() === 'BNB' || currencyId?.toLowerCase() === GELATO_NATIVE
    const token = await useToken(isBNB ? undefined : currencyId)
    return isBNB ? ETHER : token
}

const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/
function parseStringOrBytes32(str, bytes32, defaultValue) {
    return str && str.length > 0
        ? str
        : // need to check for proper bytes string and valid terminator
        bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
        ? parseBytes32String(bytes32)
        : defaultValue
}

export const fetchTokenFromChain = async (address) => {

    const Web3Connect = useWeb3Connect()
    const chainId = Web3Connect.chainId

    try {

        const tokenContract = useTokenContract2(address)
        const name = await tokenContract.name()
        const symbol = await tokenContract.symbol()
        const decimals = await tokenContract.decimals()
        if(decimals && symbol && chainId.value) {
            return new Token(
                chainId.value,
                address,
                decimals,
                parseStringOrBytes32(symbol, null, 'UNKNOWN'),
                parseStringOrBytes32(name, null, 'Unknown Token')
            )
        } else {
            return null
        }

    } catch (error) {
        console.log('fetchTokenFromChain error', error.message)
        return null
    }

    
}