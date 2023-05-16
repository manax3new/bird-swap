import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { MULTICALL_ABI, MULTICALL_ADDRESS, RPC_URL } from '@/constant/Bridge'
import CHAIN from '@/constant/Chain'

const getMulticallAbi = (chainId) => {
    return MULTICALL_ABI[chainId] ? MULTICALL_ABI[chainId] : MULTICALL_ABI[CHAIN.bnbTestnet.chainId]
}

const getMulticallAddress = (chainId) => {
    return MULTICALL_ADDRESS[chainId] ? MULTICALL_ADDRESS[chainId] : MULTICALL_ADDRESS[CHAIN.bnbTestnet.chainId]
}

const getRpcProvider = (chainId) => {
    const rpcUrl = RPC_URL[chainId] ? RPC_URL[chainId] : RPC_URL[CHAIN.bnbTestnet.chainId]
    const simpleRpcProvider = new StaticJsonRpcProvider(rpcUrl)
    return simpleRpcProvider
}

const getContract = (abi, address, signer, simpleRpcProvider) => {
    const signerOrProvider = signer ?? simpleRpcProvider
    return new Contract(address, abi, signerOrProvider)
}

export const getMulticallContract = (chainId) => {

    const abi = getMulticallAbi(chainId)
    const address = getMulticallAddress(chainId)
    const simpleRpcProvider = getRpcProvider(chainId)

    return getContract(abi, address, null, simpleRpcProvider)
}