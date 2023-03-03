import { BIG_ZERO } from '@/utils/bigNumber'
import BigNumber from 'bignumber.js'
import useWeb3Connect from '@/use/Web3Connect'
import store from '@/store'
import { getBalanceAmount } from '@/utils/formatBalance'

const deserializeFarmUserData = (farm) => {
    return {
        allowance: farm.userData ? new BigNumber(farm.userData.allowance) : BIG_ZERO,
        tokenBalance: farm.userData ? new BigNumber(farm.userData.tokenBalance) : BIG_ZERO,
        stakedBalance: farm.userData ? new BigNumber(farm.userData.stakedBalance) : BIG_ZERO,
        earnings: farm.userData ? new BigNumber(farm.userData.earnings) : BIG_ZERO,
    }
}

export const deserializeFarm = (farm) => {

    const { lpAddresses, lpSymbol, pid, dual, multiplier, isCommunity, quoteTokenPriceBusd, tokenPriceBusd } = farm

    return {
        lpAddresses,
        lpSymbol,
        pid,
        dual,
        multiplier,
        isCommunity,
        quoteTokenPriceBusd,
        tokenPriceBusd,
        token: farm.token,
        quoteToken: farm.quoteToken,
        userData: deserializeFarmUserData(farm),
        tokenAmountTotal: farm.tokenAmountTotal ? new BigNumber(farm.tokenAmountTotal) : BIG_ZERO,
        quoteTokenAmountTotal: farm.quoteTokenAmountTotal ? new BigNumber(farm.quoteTokenAmountTotal) : BIG_ZERO,
        lpTotalInQuoteToken: farm.lpTotalInQuoteToken ? new BigNumber(farm.lpTotalInQuoteToken) : BIG_ZERO,
        lpTotalSupply: farm.lpTotalSupply ? new BigNumber(farm.lpTotalSupply) : BIG_ZERO,
        tokenPriceVsQuote: farm.tokenPriceVsQuote ? new BigNumber(farm.tokenPriceVsQuote) : BIG_ZERO,
        poolWeight: farm.poolWeight ? new BigNumber(farm.poolWeight) : BIG_ZERO,
    }
}

export const farmFormatter = (farms) => {
    return farms.map((farm) => {
        return deserializeFarm(farm)
    })
}

const getCakeFarmPid = () => {
    const Web3Connect = useWeb3Connect()
    const chainId = Web3Connect.chainId
    return parseInt(chainId.value) === parseInt(chainId.MAINNET) ? 2 : 2
}

export const selectCakeFarm = () => {

    const cakeFarmPid = getCakeFarmPid()
    
    return store.state.farms.find((farm) => {
        return farm.pid === cakeFarmPid
    })
}

const selectFarmByKey = (key, value) => {
    return store.state.farms.find((farm) => {
        return farm[key] === value
    })
}

const makeLpTokenPriceFromLpSymbolSelector = (lpSymbol) => {

    const farm = selectFarmByKey('lpSymbol', lpSymbol)
  
    const deserializedFarm = deserializeFarm(farm)
    const farmTokenPriceInUsd = deserializedFarm && new BigNumber(deserializedFarm.tokenPriceBusd)
    let lpTokenPrice = BIG_ZERO

    if (deserializedFarm.lpTotalSupply.gt(0) && deserializedFarm.lpTotalInQuoteToken.gt(0)) {
    // Total value of base token in LP
    const valueOfBaseTokenInFarm = farmTokenPriceInUsd.times(deserializedFarm.tokenAmountTotal)
    // Double it to get overall value in LP
    const overallValueOfAllTokensInFarm = valueOfBaseTokenInFarm.times(2)
    // Divide total value of all tokens, by the number of LP tokens
    const totalLpTokens = getBalanceAmount(deserializedFarm.lpTotalSupply)
    lpTokenPrice = overallValueOfAllTokensInFarm.div(totalLpTokens)
    }

    return lpTokenPrice
}

export const useLpTokenPrice = (lpSymbol) => {
    return makeLpTokenPriceFromLpSymbolSelector(lpSymbol)
}