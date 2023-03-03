import { GAS_PRICE } from '@/constant/Values.js'
import useWeb3Connect from '@/use/Web3Connect'

export default () => {
    const Web3Connect = useWeb3Connect()
    const web3 = Web3Connect.getWeb3()
    return web3.utils.toWei(GAS_PRICE.default.toString(), 'gwei')
}