import { useMasterChefContract } from '@/use/Contract'
import { BigNumber } from '@ethersproject/bignumber'
import chunk from 'lodash/chunk'
import { multicallv2 } from '@/utils/multicall'
import masterchefABI from '@/constant/abi/masterchef.json'
import { getMasterChefAddress } from '@/utils/addressHelpers'

export const fetchMasterChefFarmPoolLength = async () => {
    const masterChefContract = useMasterChefContract()
    const poolLength = await masterChefContract.methods.poolLength().call()
    return BigNumber.from(poolLength)
}

const masterChefFarmCalls = (farm) => {

    const masterChefAddress = getMasterChefAddress()

    const { pid } = farm
    return pid || pid === 0
        ? [
            {
                address: masterChefAddress,
                name: 'poolInfo',
                params: [pid],
            },
            {
                address: masterChefAddress,
                name: 'totalAllocPoint',
            },
        ]
    : [null, null]
}

export const fetchMasterChefData = async (farms) => {
    const masterChefCalls = farms.map((farm) => masterChefFarmCalls(farm))
    const chunkSize = masterChefCalls.flat().length / farms.length
    const masterChefAggregatedCalls = masterChefCalls
        .filter((masterChefCall) => masterChefCall[0] !== null && masterChefCall[1] !== null)
        .flat()
    const masterChefMultiCallResult = await multicallv2(masterchefABI, masterChefAggregatedCalls)
    const masterChefChunkedResultRaw = chunk(masterChefMultiCallResult, chunkSize)
    let masterChefChunkedResultCounter = 0
    return masterChefCalls.map((masterChefCall) => {
        if (masterChefCall[0] === null && masterChefCall[1] === null) {
        return [null, null]
        }
        const data = masterChefChunkedResultRaw[masterChefChunkedResultCounter]
        masterChefChunkedResultCounter++
        return data
    })
}