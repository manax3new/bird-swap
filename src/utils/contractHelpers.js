import MultiCallAbi from '@/constant/abi/Multicall.json'
import { getMulticallAddress, getMasterChefAddress, getAddress } from '@/utils/addressHelpers'
import { Contract } from '@ethersproject/contracts'
import { simpleRpcProvider } from '@/utils/providers'
import bep20Abi from '@/constant/abi/ERC20.json'
import MasterChefABI from '@/constant/abi/masterchef.json'
import { PoolCategory } from '@/constant/config/types'
import { getPoolConfig } from '@/constant/config/pools'
import sousChefBnb from '@/constant/abi/sousChefBnb.json'
import sousChef from '@/constant/abi/sousChef.json'

export const getContract = (abi, address, signer) => {
    const signerOrProvider = signer ?? simpleRpcProvider
    return new Contract(address, abi, signerOrProvider)
}

export const getMulticallContract = () => {
    return getContract(MultiCallAbi, getMulticallAddress(), null)
}

export const getBep20Contract = (address, signer) => {
    return getContract(bep20Abi, address, signer)
}

export const getMasterChefContract = (signer) => {
    return getContract(MasterChefABI, getMasterChefAddress(), signer)
}

export const getSouschefContract = (id, signer) => {
    const poolsConfig = getPoolConfig()
    const config = poolsConfig.find((pool) => pool.sousId === id)
    const abi = config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
    return getContract(abi, getAddress(config.contractAddress), signer)
}