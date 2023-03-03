import BigNumber from 'bignumber.js'
import lpAprs from '@/constant/config/lpAprs.json'
import { CAKE_PER_YEAR, BLOCKS_PER_YEAR } from '@/constant/config'

export const getFarmApr = (poolWeight, cakePriceUsd, poolLiquidityUsd, farmAddress) => {
    const yearlyCakeRewardAllocation = poolWeight ? poolWeight.times(CAKE_PER_YEAR) : new BigNumber(NaN)
    const cakeRewardsApr = yearlyCakeRewardAllocation.times(cakePriceUsd).div(poolLiquidityUsd).times(100)
    let cakeRewardsAprAsNumber = null
    if (!cakeRewardsApr.isNaN() && cakeRewardsApr.isFinite()) {
        cakeRewardsAprAsNumber = cakeRewardsApr.toNumber()
    }
    const lpRewardsApr = lpAprs[farmAddress?.toLocaleLowerCase()] ?? 0
    return { cakeRewardsApr: cakeRewardsAprAsNumber, lpRewardsApr }
}

export const getPoolApr = (
    stakingTokenPrice,
    rewardTokenPrice,
    totalStaked,
    tokenPerBlock,
) => {
    const totalRewardPricePerYear = new BigNumber(rewardTokenPrice).times(tokenPerBlock).times(BLOCKS_PER_YEAR)
    const totalStakingTokenInPool = new BigNumber(stakingTokenPrice).times(totalStaked)
    const apr = totalRewardPricePerYear.div(totalStakingTokenInPool).times(100)
    return apr.isNaN() || !apr.isFinite() ? null : apr.toNumber()
}