import { TokenAmount } from '@pancakeswap/sdk'
import useERC20 from '@/use/ERC20.js'
import useWeb3Connect from '@/use/Web3Connect'

export default async (token, account) => {
    
    const Web3Connect = useWeb3Connect()
    const web3 = Web3Connect.getWeb3()
    const ERC20 = useERC20(web3)

    if(!account.address) {
        return 0
    }
    const balance = await ERC20.balanceOf(token.address, account.address)
    return new TokenAmount(token, balance)
}