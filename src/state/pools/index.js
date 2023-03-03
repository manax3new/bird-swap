import { 
    fetchPoolsBlockLimits,
    fetchPoolsTotalStaking,
    fetchPoolsProfileRequirement,
    fetchPoolsStakingLimits,
} from './fetchPools'
import { simpleRpcProvider } from '@/utils/providers'
import BigNumber from 'bignumber.js'
import { getTokenPricesFromFarm } from './helpers'
import { getPoolApr } from '@/utils/apr'
import { getBalanceNumber } from '@/utils/formatBalance'
import { fetchFarm } from '@/state/farms'
import { getPoolConfig } from '@/constant/config/pools'
import store from '@/store'
import { BIG_ZERO } from '@/utils/bigNumber'
import FetchPoolUser from './fetchPoolsUser'

export const fetchPoolsPublicDataAsync = async (currentBlockNumber) => {

    try {

        const poolsConfig = getPoolConfig()

        const blockLimits = await fetchPoolsBlockLimits()
        const totalStakings = await fetchPoolsTotalStaking()
        const profileRequirements = await fetchPoolsProfileRequirement()

        let currentBlock = currentBlockNumber
        if (!currentBlock) {
            currentBlock = await simpleRpcProvider.getBlockNumber()
        }

        const {farmWithUserData: farmsData} = await fetchFarm()
    
        const prices = getTokenPricesFromFarm(farmsData)
    
        const liveData = poolsConfig.map((pool) => {

            const blockLimit = blockLimits.find((entry) => entry.sousId === pool.sousId)
            const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)
            const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
            const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded

            const stakingTokenAddress = pool.stakingToken.address ? pool.stakingToken.address.toLowerCase() : null
            const stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0

            const earningTokenAddress = pool.earningToken.address ? pool.earningToken.address.toLowerCase() : null
            const earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0
            const apr = !isPoolFinished
            ? getPoolApr(
                stakingTokenPrice,
                earningTokenPrice,
                getBalanceNumber(new BigNumber(totalStaking.totalStaked), pool.stakingToken.decimals),
                parseFloat(pool.tokenPerBlock),
                )
            : 0

            const profileRequirement = profileRequirements[pool.sousId] ? profileRequirements[pool.sousId] : undefined

            return {
                ...blockLimit,
                ...totalStaking,
                profileRequirement,
                stakingTokenPrice,
                earningTokenPrice,
                apr,
                isFinished: isPoolFinished,
            }
        })

        await store.dispatch('setPoolsPublicData', liveData)
        return liveData
    } catch (error) {
        console.error('[Pools Action] error when getting public data', error)
    }
}

export const fetchPoolsStakingLimitsAsync = async () => {

    const poolsConfig = getPoolConfig()

    const pools = store.state.pools

    const poolsWithStakingLimit = pools.filter(({ stakingLimit }) => stakingLimit !== null && stakingLimit !== undefined)
        .map((pool) => pool.sousId)

    try {
        const stakingLimits = await fetchPoolsStakingLimits(poolsWithStakingLimit)
    
        const stakingLimitData = poolsConfig.map((pool) => {
            if (poolsWithStakingLimit.includes(pool.sousId)) {
                return { sousId: pool.sousId }
            }
            const { stakingLimit, numberBlocksForUserLimit } = stakingLimits[pool.sousId] || {
                stakingLimit: BIG_ZERO,
                numberBlocksForUserLimit: 0,
            }
            return {
                sousId: pool.sousId,
                stakingLimit: stakingLimit.toJSON(),
                numberBlocksForUserLimit,
            }
        })
    
        await store.dispatch('setPoolsPublicData', stakingLimitData)
        return stakingLimitData
    } catch (error) {
        console.error('[Pools Action] error when getting staking limits', error)
    }
}

export const fetchPoolsUserDataAsync = async (account) => {

    const poolsConfig = getPoolConfig()

    const fetchPoolUser = FetchPoolUser()

    const allowances = await fetchPoolUser.fetchPoolsAllowance(account)
    const stakingTokenBalances = await fetchPoolUser.fetchUserBalances(account)
    const stakedBalances = await fetchPoolUser.fetchUserStakeBalances(account)
    const pendingRewards = await fetchPoolUser.fetchUserPendingRewards(account)

    const userData = poolsConfig.map((pool) => ({
        sousId: pool.sousId,
        allowance: allowances[pool.sousId],
        stakingTokenBalance: stakingTokenBalances[pool.sousId],
        stakedBalance: stakedBalances[pool.sousId],
        pendingReward: pendingRewards[pool.sousId],
    }))

    await store.dispatch('setPoolsUserData', userData)
    return userData
}