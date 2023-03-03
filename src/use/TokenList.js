import axiosWrapper from '@/lib/axiosWrapper'
import useParseSdkEntity from '@/use/ParseSdkEntity.js'
import store from '@/store'
import useWeb3Connect from '@/use/Web3Connect'

const ParseSdkEntity = useParseSdkEntity()
const Web3Connect = useWeb3Connect()
const chainId = Web3Connect.chainId

const getToken = async (url) => {
    return (await axiosWrapper({
        method: 'get',
        url: url,
    })).data.tokens
}

const removeDuplicate = (tokens) => {

    const tokenMap = {}
    tokens.map((token) => {
        tokenMap[token.address] = token
    })
    const removeDuplicateTokens = []
    for(const key in tokenMap) {
        setTokenInfo(tokenMap[key])
        removeDuplicateTokens.push(ParseSdkEntity.createToken(tokenMap[key]))
    }

    return removeDuplicateTokens
}

export const getAllTokens = async () => {

    const urls = [
        '/tokens/pancakeswap-extend.json',
        '/tokens/pancakeswap-top-100.json',
    ]

    let tokens = []
    for(const url of urls) {
        tokens = tokens.concat(await getToken(url))
    }

    tokens = removeDuplicate(tokens).filter((token) => {
        return parseInt(token.chainId) === parseInt(chainId.value)
    })
    return tokens
}

export const getPrimaryTokens = async () => {

    const tokens = (await getToken('/tokens/pancakeswap-default.json')).filter((token) => {
        return parseInt(token.chainId) === parseInt(chainId.value)
    })

    const tokenEntities = tokens.map((token) => {
        setTokenInfo(token)
        return ParseSdkEntity.createToken(token)
    })

    return tokenEntities
}

export const getUserAddedTokens = async () => {

    let tokens = JSON.parse(store.state.userAddedTokens).filter((tokens) => {
        return parseInt(tokens.chainId) === parseInt(chainId.value)
    })

    const tokenEntities = tokens.map((token) => {
        setTokenInfo(token)
        return ParseSdkEntity.createToken(token)
    })

    return tokenEntities
}

const setTokenInfo = (token) => {
    store.commit('updateTokenInfoMap', {
        key: token.address,
        value: token,
    })
}

export const getTokenInfo = (key) => {
    return store.state.tokenInfoMap[key]
}