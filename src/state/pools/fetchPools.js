import sousChefABI from '@/constant/abi/sousChef.json'
import { getAddress } from '@/utils/addressHelpers'
import { getPoolConfig } from '@/constant/config/pools'
import { multicall, multicallv2} from '@/utils/multicall'
import erc20ABI from '@/constant/abi/ERC20.json'
import chunk from 'lodash/chunk'
import { BIG_ZERO } from '@/utils/bigNumber'
import sousChefV3 from '@/constant/abi/sousChefV3.json'
import BigNumber from 'bignumber.js'
import sousChefV2 from '@/constant/abi/sousChefV2.json'

const getPoolsWithEnd = () => {
    const poolsConfig = getPoolConfig()
    return poolsConfig.filter((p) => p.sousId !== 0)
}

const getPoolsWithV3 = () => {
    const poolsConfig = getPoolConfig()
    return poolsConfig.filter((pool) => pool?.version === 3)
}

const getStartEndBlockCalls = () => {

    const poolsWithEnd = getPoolsWithEnd()

    return poolsWithEnd.flatMap((poolConfig) => {
        return [
            {
                address: getAddress(poolConfig.contractAddress),
                name: 'startBlock',
            },
            {
                address: getAddress(poolConfig.contractAddress),
                name: 'bonusEndBlock',
            },
        ]
    })    
}

export const fetchPoolsBlockLimits = async () => {

    const startEndBlockCalls = getStartEndBlockCalls()
    const poolsWithEnd = getPoolsWithEnd()

    const startEndBlockRaw = await multicall(sousChefABI, startEndBlockCalls)

    const startEndBlockResult = startEndBlockRaw.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / 2)

        if (!resultArray[chunkIndex]) {
        // eslint-disable-next-line no-param-reassign
        resultArray[chunkIndex] = [] // start a new chunk
        }

        resultArray[chunkIndex].push(item)

        return resultArray
    }, [])

    return poolsWithEnd.map((cakePoolConfig, index) => {
        const [[startBlock], [endBlock]] = startEndBlockResult[index]
        return {
        sousId: cakePoolConfig.sousId,
        startBlock: startBlock.toNumber(),
        endBlock: endBlock.toNumber(),
        }
    })
}

const getPoolsBalanceOf = () => {
    const poolsConfig = getPoolConfig()
    return poolsConfig.map((poolConfig) => {
        return {
          address: poolConfig.stakingToken.address,
          name: 'balanceOf',
          params: [getAddress(poolConfig.contractAddress)],
        }
    })
}

export const fetchPoolsTotalStaking = async () => {

    const poolsConfig = getPoolConfig()

    const poolsBalanceOf = getPoolsBalanceOf()

    const poolsTotalStaked = await multicall(erc20ABI, poolsBalanceOf)

    return poolsConfig.map((p, index) => ({
        sousId: p.sousId,
        totalStaked: new BigNumber(poolsTotalStaked[index]).toJSON(),
    }))
}

export const fetchPoolsProfileRequirement = async () => {

    const poolsWithV3 = getPoolsWithV3()

    const poolProfileRequireCalls = poolsWithV3
        .map((validPool) => {
            const contractAddress = getAddress(validPool.contractAddress)
            return ['pancakeProfileIsRequested', 'pancakeProfileThresholdPoints'].map((method) => ({
                address: contractAddress,
                name: method,
            }))
        })
        .flat()

    const poolProfileRequireResultRaw = await multicallv2(sousChefV3, poolProfileRequireCalls, { requireSuccess: false })
    const chunkSize = poolProfileRequireCalls.length / poolsWithV3.length
    const poolStakingChunkedResultRaw = chunk(poolProfileRequireResultRaw.flat(), chunkSize)
    return poolStakingChunkedResultRaw.reduce((accum, poolProfileRequireRaw, index) => {
        const hasProfileRequired = poolProfileRequireRaw[0]
        const profileThresholdPoints = poolProfileRequireRaw[1]
            ? new BigNumber(poolProfileRequireRaw[1].toString())
            : BIG_ZERO
        return {
            ...accum,
            [poolsWithV3[index].sousId]: {
                required: hasProfileRequired,
                thresholdPoints: profileThresholdPoints.toJSON(),
            },
        }
    }, {})
}

export const fetchPoolsStakingLimits = async (poolsWithStakingLimit) => {

    const poolsConfig = getPoolConfig()

    const validPools = poolsConfig
        .filter((p) => p.stakingToken.symbol !== 'BNB' && !p.isFinished)
        .filter((p) => !poolsWithStakingLimit.includes(p.sousId))

    // Get the staking limit for each valid pool
    const poolStakingCalls = validPools
        .map((validPool) => {
            const contractAddress = getAddress(validPool.contractAddress)
            return ['hasUserLimit', 'poolLimitPerUser', 'numberBlocksForUserLimit'].map((method) => ({
                address: contractAddress,
                name: method,
            }))
        })
        .flat()

    const poolStakingResultRaw = await multicallv2(sousChefV2, poolStakingCalls, { requireSuccess: false })
    const chunkSize = poolStakingCalls.length / validPools.length
    const poolStakingChunkedResultRaw = chunk(poolStakingResultRaw.flat(), chunkSize)
    return poolStakingChunkedResultRaw.reduce((accum, stakingLimitRaw, index) => {
        const hasUserLimit = stakingLimitRaw[0]
        const stakingLimit = hasUserLimit && stakingLimitRaw[1] ? new BigNumber(stakingLimitRaw[1].toString()) : BIG_ZERO
        const numberBlocksForUserLimit = stakingLimitRaw[2] ? (stakingLimitRaw[2]).toNumber() : 0
        return {
            ...accum,
            [validPools[index].sousId]: { stakingLimit, numberBlocksForUserLimit },
        }
    }, {})
}