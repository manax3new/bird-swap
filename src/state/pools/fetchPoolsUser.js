import { getPoolConfig } from '@/constant/config/pools'
import sousChefABI from '@/constant/abi/sousChef.json'
import erc20ABI from '@/constant/abi/ERC20.json'
import { multicall } from '@/utils/multicall'
import { getMasterChefContract } from '@/utils/contractHelpers'
import { getAddress } from '@/utils/addressHelpers'
import { simpleRpcProvider } from '@/utils/providers'
import BigNumber from 'bignumber.js'
import { CAKE_TOKEN_INFO } from '@/constant/config'

export default () => {

    const poolsConfig = getPoolConfig()

    // Pool 0, Cake / Cake is a different kind of contract (master chef)
    // BNB pools use the native BNB token (wrapping ? unwrapping is done at the contract level)
    const nonBnbPools = poolsConfig.filter((pool) => pool.stakingToken.symbol !== 'BNB')
    const bnbPools = poolsConfig.filter((pool) => pool.stakingToken.symbol === 'BNB')
    const nonMasterPools = poolsConfig.filter((pool) => pool.sousId !== 0)
    const masterChefContract = getMasterChefContract()

    const fetchPoolsAllowance = async (account) => {
        const calls = nonBnbPools.map((pool) => ({
            address: pool.stakingToken.address,
            name: 'allowance',
            params: [account, getAddress(pool.contractAddress)],
        }))
        
        const allowances = await multicall(erc20ABI, calls)
        return nonBnbPools.reduce(
            (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(allowances[index]).toJSON() }),
            {},
        )
    }

    const fetchUserBalances = async (account) => {
        // Non BNB pools
        const calls = nonBnbPools.map((pool) => ({
            address: pool.stakingToken.address,
            name: 'balanceOf',
            params: [account],
        }))
        const tokenBalancesRaw = await multicall(erc20ABI, calls)
        const tokenBalances = nonBnbPools.reduce(
            (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(tokenBalancesRaw[index]).toJSON() }),
            {},
        )
      
        // BNB pools
        const bnbBalance = await simpleRpcProvider.getBalance(account)
        const bnbBalances = bnbPools.reduce(
            (acc, pool) => ({ ...acc, [pool.sousId]: new BigNumber(bnbBalance.toString()).toJSON() }),
            {},
        )
      
        return { ...tokenBalances, ...bnbBalances }
    }

    const fetchUserStakeBalances = async (account) => {
        const calls = nonMasterPools.map((p) => ({
            address: getAddress(p.contractAddress),
            name: 'userInfo',
            params: [account],
        }))
        const userInfo = await multicall(sousChefABI, calls)
        const stakedBalances = nonMasterPools.reduce(
            (acc, pool, index) => ({
                ...acc,
                [pool.sousId]: new BigNumber(userInfo[index].amount._hex).toJSON(),
            }),
            {},
        )
      
        // Cake / Cake pool
        const { amount: masterPoolAmount } = await masterChefContract.userInfo('0', account)
      
        return { ...stakedBalances, 0: new BigNumber(masterPoolAmount.toString()).toJSON() }
    }

    const fetchUserPendingRewards = async (account) => {
        const calls = nonMasterPools.map((p) => ({
            address: getAddress(p.contractAddress),
            name: 'pendingReward',
            params: [account],
        }))
        const res = await multicall(sousChefABI, calls)
        const pendingRewards = nonMasterPools.reduce(
            (acc, pool, index) => ({
                ...acc,
                [pool.sousId]: new BigNumber(res[index]).toJSON(),
            }),
            {},
        )

        const getPendingRewardMethodName = `pending${CAKE_TOKEN_INFO.nameShort}`
      
        // Cake / Cake pool
        const pendingReward = await masterChefContract[getPendingRewardMethodName]('0', account)
      
        return { ...pendingRewards, 0: new BigNumber(pendingReward.toString()).toJSON() }
    }

    return {
        fetchPoolsAllowance,
        fetchUserBalances,
        fetchUserStakeBalances,
        fetchUserPendingRewards,
    }
}
