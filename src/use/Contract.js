import useWeb3Connnect from '@/use/Web3Connect.js'
import ERC20ABI from '@/constant/abi/ERC20.json'
import IPancakePair from '@/constant/abi/IPancakePair.json'
import { ROUTER_ADDRESS} from '@/constant/config/Exchange'
import IPancakeRouter02ABI from '@/constant/abi/IPancakeRouter02.json'
import WBNBABI from '@/constant/abi/weth.json'
import { WETH } from '@pancakeswap/sdk'
import MasterChefABI from '@/constant/abi/masterchef.json'
import { MASTER_CHEF_ADDRESS } from '@/constant/config/Contract'
import { 
    getBep20Contract, 
    getMasterChefContract, 
    getContract, 
    getSouschefContract,
} from '@/utils/contractHelpers'

const Web3Connect = useWeb3Connnect()
const chainId = Web3Connect.chainId

export const useContract = (abi, address) => {
    const web3 = Web3Connect.getWeb3()
    const contract = new web3.eth.Contract(abi, address)
    return contract
}

export const useContract2 = (abi, address) => {
    return getContract(abi, address)
}

export const useTokenContract = (address) => {
    return useContract(ERC20ABI, address)
}

export const useTokenContract2 = (address) => {
    return useContract2(ERC20ABI, address)
}

export const usePairContract = (address) => {
    return useContract(IPancakePair, address)
}

export const useRouterContract = () => {
    return useContract(IPancakeRouter02ABI, ROUTER_ADDRESS[chainId.value])
}

export const useWBNBContract = () => {
    return useContract(WBNBABI, WETH[chainId.value].address)
}

export const useMasterChefContract = () => {
    return useContract(MasterChefABI, MASTER_CHEF_ADDRESS[chainId.value])
}

export const useMasterChef = () => {
    const signer = Web3Connect.getSigner()
    return getMasterChefContract(signer)
}

export const useSousChef = (id) => {
    const signer = Web3Connect.getSigner()
    return getSouschefContract(id, signer)
}

export const useERC20 = (address) => {
    const signer = Web3Connect.getSigner()
    return getBep20Contract(address, signer)
}