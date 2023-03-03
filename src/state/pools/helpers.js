import BigNumber from 'bignumber.js'
import { BIG_ZERO } from '@/utils/bigNumber'

export const getTokenPricesFromFarm = (farms) => {

    return farms.reduce((prices, farm) => {
        const quoteTokenAddress = farm.quoteToken.address.toLocaleLowerCase()
        const tokenAddress = farm.token.address.toLocaleLowerCase()
        /* eslint-disable no-param-reassign */
        if (!prices[quoteTokenAddress]) {
            prices[quoteTokenAddress] = new BigNumber(farm.quoteTokenPriceBusd).toNumber()
        }
        if (!prices[tokenAddress]) {
            prices[tokenAddress] = new BigNumber(farm.tokenPriceBusd).toNumber()
        }
        /* eslint-enable no-param-reassign */
        return prices
    }, {})
}

export const transformUserData = (userData) => {
    return {
      allowance: userData ? new BigNumber(userData.allowance) : BIG_ZERO,
      stakingTokenBalance: userData ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO,
      stakedBalance: userData ? new BigNumber(userData.stakedBalance) : BIG_ZERO,
      pendingReward: userData ? new BigNumber(userData.pendingReward) : BIG_ZERO,
    }
}

const transformProfileRequirement = (profileRequirement) => {
    return profileRequirement
    ? {
        required: profileRequirement.required,
        thresholdPoints: profileRequirement.thresholdPoints
          ? new BigNumber(profileRequirement.thresholdPoints)
          : BIG_ZERO,
      }
    : undefined
}

export const transformPool = (pool) => {
    const {
        totalStaked,
        stakingLimit,
        numberBlocksForUserLimit,
        userData,
        stakingToken,
        earningToken,
        profileRequirement,
        startBlock,
        ...rest
    } = pool
    
    return {
        ...rest,
        startBlock,
        profileRequirement: transformProfileRequirement(profileRequirement),
        stakingToken: stakingToken,
        earningToken: earningToken,
        userData: transformUserData(userData),
        totalStaked: new BigNumber(totalStaked),
        stakingLimit: new BigNumber(stakingLimit),
        stakingLimitEndBlock: numberBlocksForUserLimit + startBlock,
    }
}