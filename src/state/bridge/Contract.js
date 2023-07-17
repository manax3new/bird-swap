import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { MULTICALL_ADDRESS, RPC_URL, BRIDGE_CONTRACT_ADDRESS } from '@/constant/Bridge'
import CHAIN from '@/constant/Chain'
import MULTICALL_ABI from '@/constant/abi/Multicall'

const getMulticallAddress = (chainId) => {
    return MULTICALL_ADDRESS[chainId] ? MULTICALL_ADDRESS[chainId] : MULTICALL_ADDRESS[CHAIN.bnbTestnet.chainId]
}
export const getBridgeAddress = (chainId) => {
    return BRIDGE_CONTRACT_ADDRESS[chainId] ? BRIDGE_CONTRACT_ADDRESS[chainId] : null
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

    const abi = MULTICALL_ABI
    const address = getMulticallAddress(chainId)
    const simpleRpcProvider = getRpcProvider(chainId)

    return getContract(abi, address, null, simpleRpcProvider)
}