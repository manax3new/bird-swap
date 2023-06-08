import BigNumber from 'bignumber.js'
import { multicall } from '@/state/bridge/Multicall'
import erc20ABI from '@/constant/abi/ERC20.json'

export const getTokenBalance = async (chainId, address, account) => {

    const calls = [
        {
            address: address,
            name: 'balanceOf',
            params: [account],
        }
    ]

    try {
        const rawTokenBalances = await multicall(chainId, erc20ABI, calls)
        const parsedTokenBalances = rawTokenBalances.map((tokenBalance) => {
            return new BigNumber(tokenBalance).toJSON()
        })
        return parsedTokenBalances
    } catch (error) {
        console.log('state.bridge.getTokenBalance error', error.message)
        return '0'
    }   
}