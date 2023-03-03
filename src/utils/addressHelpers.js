import useWeb3Connect from '@/use/Web3Connect'
import { ChainId } from '@pancakeswap/sdk'
import { 
    MASTER_CHEF_ADDRESS,
    MULTICALL_ADDRESS 
} from '@/constant/config/Contract'

export const getAddress = (address) => {

    const Web3Connect = useWeb3Connect()
    const chainId = Web3Connect.chainId

    return address[chainId.value] ? address[chainId.value] : address[ChainId.MAINNET]
}

export const getMasterChefAddress = () => {
    return getAddress(MASTER_CHEF_ADDRESS)
}

export const getMulticallAddress = () => {
    return getAddress(MULTICALL_ADDRESS)
  }